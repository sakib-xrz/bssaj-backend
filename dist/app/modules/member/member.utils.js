"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const MemberKindMap = {
    [client_1.MemberKind.ADVISER]: 'AD',
    [client_1.MemberKind.HONORABLE]: 'HO',
    [client_1.MemberKind.EXECUTIVE]: 'EX',
    [client_1.MemberKind.ASSOCIATE]: 'AS',
    [client_1.MemberKind.STUDENT_REPRESENTATIVE]: 'SR',
};
const GenerateMemberId = (kind) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const kindPrefix = MemberKindMap[kind];
    const lastMember = yield prisma_1.default.member.findFirst({
        where: {
            kind,
        },
        orderBy: {
            created_at: 'desc',
        },
        select: {
            member_id: true,
        },
    });
    let serial = '01';
    if (lastMember) {
        const lastSerial = lastMember.member_id.split('-')[3];
        serial = (parseInt(lastSerial) + 1).toString().padStart(2, '0');
    }
    return `BSSAJ-${dateString}-${kindPrefix}-${serial}`;
});
const MemberUtils = {
    GenerateMemberId,
};
exports.default = MemberUtils;
