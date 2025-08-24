"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JobConstants = {
    searchableFields: ['title', 'description', 'company_name'],
    filterableFields: [
        'kind',
        'type',
        'posted_by_id',
        'posted_by_agency_id',
        'is_approved',
        'company_name',
    ],
    jobSearchableFields: ['title', 'description', 'company_name'],
};
exports.default = JobConstants;
