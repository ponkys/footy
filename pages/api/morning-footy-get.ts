import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';
import { Player } from '..';

interface QueryPlayersResponse {
  data: Player[];
  ref: { id: string };
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  const logger = Pino();
  const week = 50;
  try {
    const client = new faunadb.Client({
      secret: assertNonNullable(process.env.FAUNADB_SECRET),
      keepAlive: false,
      timeout: 15,
    });
    logger.info(`start get data for week: ${week}`);

    // retrieve all by week
    const data = await client.query<QueryPlayersResponse>(
      q.Map(
        q.Paginate(q.Match(q.Index('playersByWeek'), `${week}`)),
        q.Lambda('data', q.Get(q.Var('data')))
      )
    );

    // retrieve all by week
    const test = await client.query<QueryPlayersResponse>(
      q.Map(
        q.Paginate(q.Match(q.Index('playersByWeek'), `${week}`)),
        q.Lambda('data', q.Get(q.Var('data')))
      )
    );
    return res.status(200).json({ error: '', data: data.data });
  } catch (error) {
    logger.error(error, `Error in morning-footy-get function, week: ${week}`);
    return res.status(500).json({
      error: `Unfortunately, there was an error: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
