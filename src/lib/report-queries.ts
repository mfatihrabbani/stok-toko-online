import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getSession } from "./session.server";
import { reportQuerySchema } from "@/validators/reports";
import { getMovementReport } from "@/services/reports.service.server";

export const getReportFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => reportQuerySchema.parse(input))
  .handler(async ({ data }) => {
    const session = await getSession(getRequestHeaders() as Headers);
    if (!session) throw new Error("Masuk untuk membuka laporan.");
    return getMovementReport(session.user.id, data);
  });
