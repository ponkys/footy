import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';
import { Player } from '../';

interface QueryPlayersResponse {
  data: Player[];
}

export interface Payload {
  name: string;
  week: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = Pino();
  const { name, week, monday, tuesday, wednesday, thursday, friday } =
    req.body as Payload;

  // TODO: handle errors in data validation
  try {
    const client = new faunadb.Client({
      secret: assertNonNullable(process.env.FAUNADB_SECRET),
      keepAlive: false,
      timeout: 15,
    });
    logger.info(
      `start! Params: ${name} and week: ${week}, ${monday}, ${tuesday} and ${wednesday}, ${thursday}, ${friday}`
    );

    const data = {
      name,
      week: `${week}`,
      playing: {
        monday,

        tuesday,

        wednesday,

        thursday,

        friday,
      },
    };

    await client.query(
      q.Create(q.Collection('player'), {
        data,
      })
    );

    return res.status(200).json({ error: '', data });
  } catch (error) {
    logger.error(error, 'Error in morning-footy-subscribe function');
    return res.status(500).json({
      error: `Unfortunately, there was an error: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
