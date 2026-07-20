<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // 1. Trigger for new purchase request
        DB::unprepared("
            CREATE TRIGGER after_marketplace_requests_insert
            AFTER INSERT ON marketplace_requests
            FOR EACH ROW
            BEGIN
                DECLARE owner_id INT;
                DECLARE listing_title VARCHAR(255);
                
                SELECT user_id, title INTO owner_id, listing_title 
                FROM marketplace_listings 
                WHERE id = NEW.marketplace_listing_id;
                
                IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        owner_id, 
                        JSON_OBJECT(
                            'title', 'New Purchase Request',
                            'message', CONCAT('Someone requested to buy your listing \"', listing_title, '\".'),
                            'type', 'marketplace',
                            'link', CONCAT('/app/marketplace?open=', NEW.marketplace_listing_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 2. Trigger for purchase request status update
        DB::unprepared("
            CREATE TRIGGER after_marketplace_requests_update
            AFTER UPDATE ON marketplace_requests
            FOR EACH ROW
            BEGIN
                DECLARE listing_title VARCHAR(255);
                
                IF OLD.status <> NEW.status THEN
                    SELECT title INTO listing_title 
                    FROM marketplace_listings 
                    WHERE id = NEW.marketplace_listing_id;
                    
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        NEW.user_id, 
                        JSON_OBJECT(
                            'title', CONCAT('Purchase Request ', UPPER(SUBSTRING(NEW.status, 1, 1)), SUBSTRING(NEW.status, 2)),
                            'message', CONCAT('Your request for \"', listing_title, '\" has been ', NEW.status, '.'),
                            'type', 'marketplace',
                            'link', CONCAT('/app/marketplace?open=', NEW.marketplace_listing_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 3. Trigger for new exchange request
        DB::unprepared("
            CREATE TRIGGER after_exchange_requests_insert
            AFTER INSERT ON exchange_requests
            FOR EACH ROW
            BEGIN
                DECLARE owner_id INT;
                DECLARE offering_title VARCHAR(255);
                
                SELECT user_id, offering INTO owner_id, offering_title 
                FROM exchange_posts 
                WHERE id = NEW.exchange_post_id;
                
                IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        owner_id, 
                        JSON_OBJECT(
                            'title', 'New Exchange Request',
                            'message', CONCAT('Someone requested to swap for your \"', offering_title, '\".'),
                            'type', 'exchange',
                            'link', CONCAT('/app/exchange?open=', NEW.exchange_post_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 4. Trigger for exchange request status update
        DB::unprepared("
            CREATE TRIGGER after_exchange_requests_update
            AFTER UPDATE ON exchange_requests
            FOR EACH ROW
            BEGIN
                DECLARE offering_title VARCHAR(255);
                
                IF OLD.status <> NEW.status THEN
                    SELECT offering INTO offering_title 
                    FROM exchange_posts 
                    WHERE id = NEW.exchange_post_id;
                    
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        NEW.user_id, 
                        JSON_OBJECT(
                            'title', CONCAT('Exchange Request ', UPPER(SUBSTRING(NEW.status, 1, 1)), SUBSTRING(NEW.status, 2)),
                            'message', CONCAT('Your swap request for \"', offering_title, '\" has been ', NEW.status, '.'),
                            'type', 'exchange',
                            'link', CONCAT('/app/exchange?open=', NEW.exchange_post_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 5. Trigger for new roommate application
        DB::unprepared("
            CREATE TRIGGER after_roommate_requests_insert
            AFTER INSERT ON roommate_requests
            FOR EACH ROW
            BEGIN
                DECLARE owner_id INT;
                DECLARE post_title VARCHAR(255);
                
                SELECT user_id, title INTO owner_id, post_title 
                FROM roommate_posts 
                WHERE id = NEW.roommate_post_id;
                
                IF owner_id IS NOT NULL AND owner_id <> NEW.requester_id THEN
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        owner_id, 
                        JSON_OBJECT(
                            'title', 'New Roommate Application',
                            'message', CONCAT('Someone applied to join your roommate post \"', post_title, '\".'),
                            'type', 'roommates',
                            'link', CONCAT('/app/roommates?open=', NEW.roommate_post_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 6. Trigger for roommate application status update
        DB::unprepared("
            CREATE TRIGGER after_roommate_requests_update
            AFTER UPDATE ON roommate_requests
            FOR EACH ROW
            BEGIN
                DECLARE post_title VARCHAR(255);
                
                IF OLD.status <> NEW.status THEN
                    SELECT title INTO post_title 
                    FROM roommate_posts 
                    WHERE id = NEW.roommate_post_id;
                    
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        NEW.requester_id, 
                        JSON_OBJECT(
                            'title', CONCAT('Roommate Application ', UPPER(SUBSTRING(NEW.status, 1, 1)), SUBSTRING(NEW.status, 2)),
                            'message', CONCAT('Your roommate application for \"', post_title, '\" has been ', NEW.status, '.'),
                            'type', 'roommates',
                            'link', CONCAT('/app/roommates?open=', NEW.roommate_post_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");

        // 7. Trigger for new blood request match/response
        DB::unprepared("
            CREATE TRIGGER after_blood_donation_responses_insert
            AFTER INSERT ON blood_donation_responses
            FOR EACH ROW
            BEGIN
                DECLARE owner_id INT;
                DECLARE request_blood_group VARCHAR(10);
                
                SELECT user_id, blood_group INTO owner_id, request_blood_group 
                FROM blood_requests 
                WHERE id = NEW.blood_request_id;
                
                IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
                    INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
                    VALUES (
                        UUID(), 
                        'App\\\\Notifications\\\\DatabaseNotification', 
                        'App\\\\Models\\\\User', 
                        owner_id, 
                        JSON_OBJECT(
                            'title', 'New Blood Donor Match',
                            'message', CONCAT('A student responded to your ', request_blood_group, ' blood request.'),
                            'type', 'blood',
                            'link', CONCAT('/app/blood?open=', NEW.blood_request_id)
                        ),
                        NOW(), 
                        NOW()
                    );
                END IF;
            END;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared("DROP TRIGGER IF EXISTS after_marketplace_requests_insert;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_marketplace_requests_update;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_exchange_requests_insert;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_exchange_requests_update;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_roommate_requests_insert;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_roommate_requests_update;");
        DB::unprepared("DROP TRIGGER IF EXISTS after_blood_donation_responses_insert;");
    }
};
