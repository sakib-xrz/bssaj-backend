"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommitteeSchema = exports.CreateCommitteeSchema = void 0;
const zod_1 = require("zod");
exports.CreateCommitteeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        designation: zod_1.z.string({ required_error: 'Designation is required' }),
        term_start_year: zod_1.z.string({
            required_error: 'Term start year is required',
        }),
        term_end_year: zod_1.z.string({ required_error: 'Term end year is required' }),
    }),
});
exports.UpdateCommitteeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        designation: zod_1.z.string().optional(),
        term_start_year: zod_1.z.string().optional(),
        term_end_year: zod_1.z.string().optional(),
    }),
});
const CommitteeValidation = {
    CreateCommitteeSchema: exports.CreateCommitteeSchema,
    UpdateCommitteeSchema: exports.UpdateCommitteeSchema,
};
exports.default = CommitteeValidation;
