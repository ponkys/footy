import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';
import { Player } from '../';

interface QueryPlayersResponse {
  data: Player[];
}
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = Pino();
  try {
    const client = new faunadb.Client({
      secret: assertNonNullable(process.env.FAUNADB_SECRET),
      keepAlive: false,
      timeout: 15,
    });
    logger.info('start!');
    // create
    // const data = await client.query(
    //   q.Create(q.Collection('player'), {
    //     data: {
    //       name: 'Fino',
    //       week: '50',
    //       playing: [
    //         {
    //           monday: false,
    //         },
    //         {
    //           tuesday: false,
    //         },
    //         {
    //           wednesday: true,
    //         },
    //         {
    //           thursday: false,
    //         },
    //         {
    //           friday: false,
    //         },
    //       ],
    //     },
    //   })
    // );

    // retrieve all by week
    const data = await client.query<QueryPlayersResponse>(
      q.Map(
        q.Paginate(q.Match(q.Index('playersByWeek'), '50')),
        q.Lambda('data', q.Get(q.Var('data')))
      )
    );

    return res.status(200).json({ error: '', data: data.data });
  } catch (error) {
    logger.error(error, 'Error in morning-footy-subscribe function');
    return res.status(500).json({
      error: `Unfortunately, there was an error: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
