import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Payload } from './api/morning-footy-post';
import { string } from 'yup';

export interface Player {
  name: string;
  week: string;
  ref: string;
  playing: Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    boolean
  >;
}
[];

type TemplateState = 'loading' | 'error' | 'success' | 'idle' | 'edit' | 'add';

export default function Footy() {
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [buttonValidity, setButtonValidity] = useState(false);
  const [state, setState] = useState<TemplateState>('idle');
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editRef, setEditRef] = useState<Player & { index: number }>();
  const [name, setValidName] = useState(false);
  const mondayRef = useRef<HTMLInputElement | null>(null);
  const tuesdayRef = useRef<HTMLInputElement | null>(null);
  const wednesdayRef = useRef<HTMLInputElement | null>(null);
  const thursdayRef = useRef<HTMLInputElement | null>(null);
  const fridayRef = useRef<HTMLInputElement | null>(null);

  const handleButtonValidity = () => {
    setButtonValidity(name && state !== 'loading');
  };

  const handleOnInputChange = async (name: string) => {
    setInput(name);
    const validator = string().required();
    const isValidEmail = await validator.isValid(name);
    setValidName(isValidEmail);
  };

  const deleteRef = async (e: SyntheticEvent, ref: string, index: number) => {
    e.preventDefault();
    const res = await fetch('/api/morning-footy-delete', {
      body: JSON.stringify({ ref }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const { error } = await res.json();
    if (error !== '') {
      // 4. If there was an error, update the message in state.
      setMessage(error);
      setState('error');
      return;
    }
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startEditRef = async (e: SyntheticEvent, index: number) => {
    e.preventDefault();
    setState('edit');
    const editedPlayer = players.find((_, i) => i === index);
    if (editedPlayer === undefined) {
      setMessage(`Player in idex ${index} not found`);
      setState('idle');
      // TODO: reset to idle state visually
      return;
    }
    setInput(editedPlayer.name);
    setEditRef({ ...editedPlayer, index: index });
  };

  useEffect(() => {
    if (state === 'add' || state === 'edit') {
      if (inputRef !== null) {
        inputRef.current?.focus();
      }
      return;
    }
  }, [state]);

  const onEditRef = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (editRef === undefined) {
      // 4. If there was an error, update the message in state.
      setMessage(`Reference for edited player isn't available`);
      setState('error');
      return;
    }
    const payload: Omit<Payload, 'week'> & { ref: string } = {
      name: input,
      monday: mondayRef.current?.checked ?? false,
      tuesday: tuesdayRef.current?.checked ?? false,
      wednesday: wednesdayRef.current?.checked ?? false,
      thursday: thursdayRef.current?.checked ?? false,
      friday: fridayRef.current?.checked ?? false,
      ref: editRef.ref,
    } as const;

    const res = await fetch('/api/morning-footy-edit', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const { error } = await res.json();
    if (error !== '') {
      // 4. If there was an error, update the message in state.
      setMessage(error);
      setState('error');
      return;
    }
    const { index } = editRef;
    const { name, monday, tuesday, wednesday, thursday, friday } = payload;
    setPlayers([
      ...players.slice(0, index),
      {
        ...players[index],
        name,
        playing: { monday, tuesday, wednesday, thursday, friday },
      },
      ...players.slice(index + 1),
    ]);
    closeForm();
  };

  const closeForm = (e?: SyntheticEvent) => {
    if (e !== undefined) {
      e.preventDefault();
    }
    setState('idle');
    setInput('');
  };

  const sendData = async (e: SyntheticEvent) => {
    e.preventDefault(); // prevents page reload
    if (state === 'success') {
      location.reload();
    }
    setState('loading');
    setButtonValidity(false);
    const payload: Payload = {
      name: input,
      week: 50,
      monday: mondayRef.current?.checked ?? false,
      tuesday: tuesdayRef.current?.checked ?? false,
      wednesday: wednesdayRef.current?.checked ?? false,
      thursday: thursdayRef.current?.checked ?? false,
      friday: fridayRef.current?.checked ?? false,
    } as const;
    const res = await fetch('/api/morning-footy-post', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { error, data } = await res.json();
    if (error) {
      // 4. If there was an error, update the message in state.
      setMessage(error);
      setButtonValidity(true);
      setState('error');
      return;
    }

    setPlayers([...players, data]);
    setMessage(`${input} get ready to play!`);
    setState('idle');
    setButtonValidity(true);
    resetForm();
  };

  const resetForm = () => {
    setInput('');
  };

  useEffect(() => {
    handleButtonValidity();
  }, [name, state]);

  useEffect(() => {
    const getData = async () => {
      setMessage('Loading...');
      const res = await fetch('/api/morning-footy-get', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const { error, data } = await res.json();
      if (error) {
        // 4. If there was an error, update the message in state.
        setMessage(error);
        return;
      }
      setPlayers(
        data.map((v: { data: Player[]; ref: { ['@ref']: { id: string } } }) => {
          return { ...v.data, ref: v.ref['@ref'].id };
        })
      );
      setMessage('');
      setState('idle');
    };
    getData();
  }, []);

  return (
    <div>
      <Head>
        <title>Morning Footy - Ponkys</title>
        <meta name='description' content='Sign up for morning footy' />
      </Head>
      <main className='newsletter-main'>
        <section>
          {state === 'idle' ? (
            <button onClick={() => setState('add')}>Join</button>
          ) : (
            <form
              className='form'
              onSubmit={(e) => {
                if (state === 'add') {
                  return sendData(e);
                }
                return onEditRef(e);
              }}
            >
              <label htmlFor='name'>Name:</label>
              <input
                type='name'
                id='name'
                placeholder='Your football name'
                aria-label='name'
                required
                name='name'
                value={input}
                ref={inputRef}
                onChange={(e) => handleOnInputChange(e.target.value)}
              ></input>
              <label>
                <input
                  type='checkbox'
                  name='monday'
                  ref={mondayRef}
                  value='true'
                ></input>
                Monday
              </label>
              <label>
                <input
                  type='checkbox'
                  name='tuesday'
                  ref={tuesdayRef}
                  value='true'
                ></input>
                Tuesday
              </label>
              <label>
                <input
                  type='checkbox'
                  name='wednesday'
                  ref={wednesdayRef}
                  value='true'
                ></input>
                Wednesday
              </label>
              <label>
                <input
                  type='checkbox'
                  name='Thursday'
                  ref={thursdayRef}
                  value='true'
                ></input>
                Thursday
              </label>
              <label>
                <input
                  type='checkbox'
                  name='friday'
                  ref={fridayRef}
                  value='true'
                ></input>
                Friday
              </label>
              <a onClick={closeForm} className='cursor'>
                <i>Close</i>
              </a>
              <button type='submit' disabled={!buttonValidity}>
                <b>{state === 'add' ? 'Play' : 'Edit'}</b>
              </button>
            </form>
          )}
        </section>
        <section>
          {players.length === 0 ? null : (
            <table className='table'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>monday</th>
                  <th>tuesday</th>
                  <th>wednesday</th>
                  <th>thursday</th>
                  <th>friday</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  return (
                    <tr key={`${i}-${player.name}`}>
                      <td key={`${i}-${player.name}`}>{player.name}</td>
                      <td key={`${i}-${player.name}-monday`}>
                        {player.playing.monday ? (
                          <span role='img' aria-label='football ball'>
                            ⚽️
                          </span>
                        ) : (
                          <span role='img' aria-label='red X'>
                            ❌
                          </span>
                        )}
                      </td>
                      <td key={`${i}-${player.name}-tuesday`}>
                        {player.playing.tuesday ? (
                          <span role='img' aria-label='football ball'>
                            ⚽️
                          </span>
                        ) : (
                          <span role='img' aria-label='red X'>
                            ❌
                          </span>
                        )}
                      </td>
                      <td key={`${i}-${player.name}-wednesday`}>
                        {player.playing.wednesday ? (
                          <span role='img' aria-label='football ball'>
                            ⚽️
                          </span>
                        ) : (
                          <span role='img' aria-label='red X'>
                            ❌
                          </span>
                        )}
                      </td>
                      <td key={`${i}-${player.name}-thursday`}>
                        {player.playing.thursday ? (
                          <span role='img' aria-label='football ball'>
                            ⚽️
                          </span>
                        ) : (
                          <span role='img' aria-label='red X'>
                            ❌
                          </span>
                        )}
                      </td>
                      <td key={`${i}-${player.name}-friday`}>
                        {player.playing.friday ? (
                          <span role='img' aria-label='football ball'>
                            ⚽️
                          </span>
                        ) : (
                          <span role='img' aria-label='red X'>
                            ❌
                          </span>
                        )}
                      </td>
                      <td
                        className='cursor'
                        key={`EDIT-${player.name}`}
                        onClick={(e) => startEditRef(e, i)}
                      >
                        Edit
                      </td>
                      <td
                        className='cursor'
                        key={`DELETE-${player.name}`}
                        onClick={(e) => deleteRef(e, player.ref, i)}
                      >
                        Delete
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
        {message !== '' ? (
          <section>
            <strong>{message}</strong>
          </section>
        ) : null}
      </main>
      <style>{`
        .newsletter-main {
          display: grid;
          place-items: center;
        }

        .form {
          max-width: 31.25rem;

        }

        .cursor {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
