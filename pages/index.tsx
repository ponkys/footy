import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Payload } from './api/morning-footy-subscribe';
import { string } from 'yup';

export interface Player {
  name: string;
  week: string;
  ref: unknown;
  playing: Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    boolean
  >;
}
[];

type TemplateState = 'loading' | 'error' | 'success' | 'idle';

export default function Footy() {
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [buttonValidity, setButtonValidity] = useState(false);
  const [state, setState] = useState<TemplateState>('idle');
  const [input, setInput] = useState('');
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
    const res = await fetch('/api/morning-footy-subscribe', {
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
    setMessage('Success! 🎉');
    setState('success');
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
      setMessage('Success! 🎉');
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
          {state === 'success' ? (
            <button onClick={() => setState('idle')}>Add Player</button>
          ) : (
            <form className='form' onSubmit={sendData}>
              <label htmlFor='name'>Name:</label>
              <input
                type='name'
                id='name'
                placeholder='Your football name'
                aria-label='name'
                required
                name='name'
                value={input}
                onChange={(e) => handleOnInputChange(e.target.value)}
              ></input>
              <label>
                Monday
                <input
                  type='checkbox'
                  name='monday'
                  ref={mondayRef}
                  value='true'
                ></input>
              </label>
              <label>
                Tuesday
                <input
                  type='checkbox'
                  name='tuesday'
                  ref={tuesdayRef}
                  value='true'
                ></input>
              </label>
              <label>
                Wednesday
                <input
                  type='checkbox'
                  name='wednesday'
                  ref={wednesdayRef}
                  value='true'
                ></input>
              </label>
              <label>
                Thursday
                <input
                  type='checkbox'
                  name='Thursday'
                  ref={thursdayRef}
                  value='true'
                ></input>
              </label>
              <label>
                Friday
                <input
                  type='checkbox'
                  name='friday'
                  ref={fridayRef}
                  value='true'
                ></input>
              </label>
              <button type='submit' disabled={!buttonValidity}>
                Play
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
                      <td key={`EDIT-${player.name}`}>Edit</td>
                      <td key={`DELETE-${player.name}`}>Delete</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
      <style>{`
        .newsletter-main {
          display: grid;
          place-items: center;
        }

        .form {
          max-width: 31.25rem;

        }
      `}</style>
    </div>
  );
}
