import type { ZodSchema, z } from "zod";

export function fn<
  Arg1 extends ZodSchema,
  Callback extends (arg1: z.output<Arg1>) => ReturnType<Callback>
>(arg1: Arg1, cb: Callback) {
  const result = (input: z.input<typeof arg1>): ReturnType<Callback> => {
    const parsed = arg1.parse(input);
    return cb.apply(cb, [parsed as unknown]);
  };
  result.schema = arg1;
  return result;
}

export const DateUtil = {
  MaxValue: new Date(864000000000000),
  MinValue: new Date(-8640000000000000),
};
