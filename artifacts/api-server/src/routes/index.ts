import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shelfClickRouter from "./shelf-click";
import editorSessionRouter from "./editor-session";
import trendQueueRouter from "./trend-queue";
import correctionsRouter from "./corrections";

const router: IRouter = Router();

router.use(healthRouter);
router.use(editorSessionRouter);
router.use(shelfClickRouter);
router.use(trendQueueRouter);
router.use(correctionsRouter);

export default router;
