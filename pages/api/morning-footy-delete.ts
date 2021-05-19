import faunadb, { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import Pino from 'pino';
import { assertNonNullable } from '../../utils';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = Pino();
  const { ref } = req.body as { ref: string };
  try {
    const client = new faunadb.Client({
      secret: assertNonNullable(process.env.FAUNADB_SECRET),
      keepAlive: false,
      timeout: 10,
    });

    logger.info(`Start delete for ref: ${ref}`);

    // retrieve all by week
    await client.query(q.Delete(q.Ref(q.Collection('player'), ref)));

    return res.status(200).json({ error: '' });
  } catch (error) {
    logger.error(error, `Error in morning-footy-delete function, ref: ${ref}`);
    return res.status(500).json({
      error: `There was an error deleting your player: ${
        error.message || error.toString()
      } 😔`,
    });
  }
};
