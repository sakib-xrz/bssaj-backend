-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_id_fkey" FOREIGN KEY ("posted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
