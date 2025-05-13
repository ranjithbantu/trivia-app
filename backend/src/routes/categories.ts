import { Router } from 'express';
import Category   from '../models/Category';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    /* --------------------------------------------------------------------- */
    /* aggregate categories + question‐count in a single trip to MongoDB     */
    /* --------------------------------------------------------------------- */
    const cats = await Category.aggregate([
      /* match every document in “categories” ------------------------------ */
      { $match: {} },

      /* look-up matching questions ---------------------------------------- */
      {
        $lookup: {
          from: 'questions',          
          localField: '_id',          
          foreignField: 'category',   
          as: 'questions'
        }
      },

      /* add “count” field -------------------------------------------------- */
      { $addFields: { count: { $size: '$questions' } } },

      /* keep only the fields the FE really needs -------------------------- */
      { $project: { _id: { $toString: '$_id' }, name: 1, count: 1 } },

      /* alphabetical order in the dropdown -------------------------------- */
      { $sort: { name: 1 } }
    ]);

    res.json(cats);
  } catch (err) {
    next(err);
  }
});

export default router;