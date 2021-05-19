import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';

interface Payload {
  ref: string;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = Pino();

  const { name, ref, monday, tuesday, wednesday, thursday, friday } =
    req.body as Payload;

  logger.info(
    `Start edit for ref: ${ref} with name: ${name} and playing on Monday:${monday}, Tuesday: ${tuesday}, Wednesday: ${wednesday}, Thursday: ${thursday}, and Friday: ${friday}`
  );

  const data = {
    name,
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

    await client.query(q.Update(q.Ref(q.Collection('player'), ref), { data }));
    return res.status(200).json({ error: '' });
  } catch (error) {
    logger.error(
      error,
      `Error in morning-footy-edit function, ref: ${ref}, data: ${JSON.stringify(
        data
      )}`
    );
    return res.status(500).json({
      error: `There was an error updating your player: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
