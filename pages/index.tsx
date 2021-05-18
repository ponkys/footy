import { SyntheticEvent, useState } from 'react';
import Head from 'next/head';

export interface Player {
  name: string;
  week: string;
  playing: Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    boolean
  >;
}
[];

export default function Footy() {
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault(); // prevents page reload
    const res = await fetch('/api/morning-footy-subscribe', {
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
    setPlayers(data.map((v: { data: Player[] }) => v.data));
    setMessage('Success! 🎉');
  };

  return (
    <div>
      <Head>
        <title>Morning Footy - Ponkys</title>
        <meta name='description' content='Sign up for morning footy' />
      </Head>
      <main className='newsletter-main'>
        <section>
          {players.length === 0 ? (
            <form className='form' onSubmit={handleSubmit}>
              <button type='submit'>View week</button>
            </form>
          ) : (
            <table className='table'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>monday</th>
                  <th>tuesday</th>
                  <th>wednesday</th>
                  <th>thursday</th>
                  <th>friday</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  return (
                    <tr key={`${i}-${player.name}`}>
                      <td key={`${i}-${player.name}`}>{player.name}</td>
                      <td key={`${i}-${player.name}-monday`}>
                        {' '}
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
                        )}{' '}
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
                        )}{' '}
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
                        )}{' '}
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
                        )}{' '}
                      </td>
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
