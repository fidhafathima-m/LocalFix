"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountRepository = void 0;
const SocialAccountSchema_1 = require("../../models/SocialAccountSchema");
const BaseRepository_1 = require("../BaseRepository");
class SocialAccountRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(SocialAccountSchema_1.SocialAccount);
    }
    async findByProviderId(providerId) {
        return await SocialAccountSchema_1.SocialAccount.findOne({ providerId });
    }
    async findByUserIdAndProvider(userId, provider) {
        return await SocialAccountSchema_1.SocialAccount.findOne({ userId, provider });
    }
}
exports.SocialAccountRepository = SocialAccountRepository;
