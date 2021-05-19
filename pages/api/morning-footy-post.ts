import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';

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
  logger.info(
    `Start post player wit params: ${name} and week: ${week}, ${monday}, ${tuesday} and ${wednesday}, ${thursday}, ${friday}`
  );

  let data = {
    name,
    week: `${week}`,
    playing: {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
    },
  } as const;

  try {
    const client = new faunadb.Client({
      secret: assertNonNullable(process.env.FAUNADB_SECRET),
      keepAlive: false,
      timeout: 10,
    });

    const dbRes = await client.query<{ ref: { id: string } }>(
      q.Create(q.Collection('player'), {
        data,
      })
    );

    return res
      .status(200)
      .json({ error: '', data: { ...data, ref: dbRes.ref.id } });
  } catch (error) {
    logger.error(error, 'Error in morning-footy-post function');
    return res.status(500).json({
      error: `There was an error when joining to play: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
