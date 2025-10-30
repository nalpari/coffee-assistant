-- Migration: Insert menu and image data
-- Created: 2025-10-30
-- Description:
--   1. Insert menu data from menu_202510281452.sql
--   2. Insert image data from image_202510281454.sql

-- =============================================================================
-- Step 1: Insert menu data
-- =============================================================================
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-05-22 22:34:24.26','hc_super','2022-03-21 18:35:47.68',false,'SPECIALTY로 즐기는 특별한 한잔!',NULL,true,NULL,'아메리카노 HOT',1,1500,'E0101',1),
	 ('hc_super','2021-05-22 22:37:16.387','hc_super','2022-03-21 18:35:47.683',true,'SPECIALTY로 즐기는 특별한 한잔!',NULL,false,NULL,'아메리카노 ICE',2,2000,'E0101',1),
	 ('hc_super','2021-05-22 22:38:54.34','hc_super','2022-03-21 18:35:47.683',true,'아메리카노+꿀',NULL,true,NULL,'꿀 아메리카노',3,2500,'E0101',1),
	 ('hc_super','2021-05-22 22:42:04.487','hc_super','2022-03-21 18:35:47.683',true,'아메리카노에 바닐라시럽 추가',NULL,true,NULL,'바닐라 아메리카노',5,2500,'E0101',1),
	 ('hc_super','2021-05-22 22:43:23.363','hc_super','2022-03-21 18:35:47.683',true,'아메리카노에 헤이즐넛 시럽 추가',NULL,true,NULL,'헤이즐넛 아메리카노',4,2500,'E0101',1),
	 ('hc_super','2021-05-22 22:45:33.74','hc_super','2022-03-21 18:35:47.683',true,'원두선택 가능, HOT/ICE',NULL,true,NULL,'카페라떼',7,7200,'E0101',1),
	 ('hc_super','2021-05-22 22:47:33.02','hc_super','2022-03-21 18:35:47.683',true,'카페라떼에 바닐라 시럽 추가',NULL,true,NULL,'바닐라 라떼',9,3200,'E0101',1),
	 ('hc_super','2021-05-22 22:48:21.263','hc_super','2022-03-21 18:35:47.683',true,'카페라떼에 헤이즐넛 시럽 추가',NULL,true,NULL,'헤이즐넛 라떼',8,3200,'E0101',1),
	 ('hc_super','2021-05-22 22:50:01.44','hc_super','2022-03-21 18:35:47.683',true,'원두선택, HOT/ICE',NULL,true,NULL,'연유라떼',13,3700,'E0101',1),
	 ('hc_super','2021-05-28 14:59:52.56','hc_super','2022-03-21 18:35:47.683',true,'ICE only, 원두선택',NULL,false,NULL,'티라미수라떼(ICE)',16,4000,'E0101',1);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-05-28 15:15:42.453','hc_super','2022-03-21 18:35:47.683',true,'HOT/ICE',NULL,true,NULL,'카푸치노',10,7200,'E0101',1),
	 ('hc_super','2021-05-28 15:24:00.577','hc_super','2022-03-21 18:35:47.683',true,'HOT/ICE',NULL,true,NULL,'카페모카',11,3700,'E0101',1),
	 ('hc_super','2021-05-28 15:25:31.62','hc_super','2022-03-21 18:35:47.683',true,'HOT/ICE',NULL,true,NULL,'카라멜 마끼아또',12,3500,'E0101',1),
	 ('hc_super','2021-05-28 15:28:39.677','hc_super','2022-03-21 18:35:47.683',true,'ICE only',NULL,false,NULL,'큐브라떼',14,3800,'E0101',1),
	 ('hc_super','2021-07-25 15:42:41.43','hc_super','2022-03-21 18:35:47.683',true,'3샷 1리터 아메리카노',NULL,false,NULL,'힘이나커피 ICE',6,3000,'E0101',1),
	 ('hc_super','2021-07-25 15:46:30.49','hc_super','2022-03-21 18:35:47.683',true,'HOT/ICE',NULL,true,NULL,'민트카페모카',15,4300,'E0101',1),
	 ('hc_super','2021-07-25 15:49:17.16','hc_super','2022-03-21 18:35:47.687',true,'샷추가/Non샷 가능',NULL,false,NULL,'달고나라떼',17,4200,'E0101',1),
	 ('hc_super','2021-07-25 16:52:14.55','hc_super','2021-07-26 13:22:11.707',true,'고소하고 부드럽게, 힘이나 No.1 signature',NULL,false,NULL,'흑임자크림라떼',1,4200,'E0101',3),
	 ('hc_super','2021-07-25 16:53:39.4','hc_super','2021-07-26 13:25:54.38',false,'따뜻하게 즐기는 향긋한 와인의 풍미(논알콜 뱅쇼)',NULL,true,NULL,'힘나쇼',2,4200,'E0101',3),
	 ('hc_super','2021-07-25 16:54:27.597','hc_super','2021-07-26 13:28:10.1',true,'시원하게 즐기는 향긋한 와인의 풍미(논알콜 상그리아)',NULL,false,NULL,'힘나리아',3,4200,'E0101',3);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-07-25 16:55:15.177','hc_super','2021-07-26 13:28:54.793',true,'현지의 맛 그대로! 코코넛 향 가득한 커피스무디',NULL,false,NULL,'월남커피',4,4200,'E0101',3),
	 ('hc_super','2021-05-22 23:12:30.097','hc_super','2022-03-21 18:51:17.88',true,'망고요거트스무디',NULL,false,NULL,'망고요거트스무디',6,3900,'E0101',4),
	 ('hc_super','2021-05-28 15:06:11.387','hc_super','2022-03-21 18:50:27.553',true,'퐁프라페 플레인',NULL,false,NULL,'퐁프라페 플레인',14,3900,'E0101',4),
	 ('hc_super','2021-07-25 17:10:31','hc_super','2022-03-21 18:50:06.337',true,'퐁프라페 딸기',NULL,false,NULL,'퐁프라페 딸기',15,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:11:49.793','hc_super','2022-03-21 18:49:21.82',true,'퐁프라페 바나나',NULL,false,NULL,'퐁프라페 바나나',16,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:13:48.653','hc_super','2022-03-21 18:49:00.943',true,'퐁프라페 오곡',NULL,false,NULL,'퐁프라페 오곡',17,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:14:59.13','hc_super','2022-03-21 18:48:35.49',true,'바나나프라페 플레인',NULL,false,NULL,'바나나프라페 플레인',18,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:42:54.28','hc_super','2022-03-21 18:47:58.877',true,'바나나프라페 딸기',NULL,false,NULL,'바나나프라페 딸기',19,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:43:49.09','hc_super','2022-03-21 18:47:39.09',true,'바나나프라페 초코',NULL,false,NULL,'바나나프라페 초코',20,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:44:44.923','hc_super','2022-03-21 18:47:14.35',true,'쿠키프라페',NULL,false,NULL,'쿠키프라페',10,4200,'E0101',4);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-07-25 17:45:39.853','hc_super','2022-03-21 18:47:02.677',true,'초코프라페',NULL,false,NULL,'초코프라페',7,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:46:05.1','hc_super','2022-03-21 18:46:52.607',true,'녹차프라페',NULL,false,NULL,'녹차프라페',8,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:46:27.4','hc_super','2022-03-21 18:46:38.6',true,'커피프라페',NULL,false,NULL,'커피프라페',11,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:47:20.73','hc_super','2022-03-21 18:46:20.647',true,'민트초코프라페',NULL,false,NULL,'민트초코프라페',13,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:48:21.4','hc_super','2022-03-21 18:46:09.053',true,'플레인요거트스무디',NULL,false,NULL,'플레인요거트스무디',1,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:48:56.897','hc_super','2022-03-21 18:45:47.68',true,'딸기요거트스무디',NULL,false,NULL,'딸기요거트스무디',2,4200,'E0101',4),
	 ('hc_super','2021-07-25 17:49:55.953','hc_super','2022-03-21 18:45:34.58',true,'블루베리요거트스무디',NULL,false,NULL,'블루베리요거트스무디',4,3900,'E0101',4),
	 ('hc_super','2021-07-25 16:02:33.267','hc_super','2022-03-21 18:34:21.167',true,'HOT/ICE',NULL,true,NULL,'홍차라떼',4,3500,'E0101',2),
	 ('hc_super','2021-05-22 22:55:19.303','hc_super','2022-03-21 18:34:21.167',true,'HOT/ICE',NULL,true,NULL,'고구마라떼',6,3800,'E0101',2),
	 ('hc_super','2021-07-25 16:07:53.113','hc_super','2022-03-21 18:34:21.167',true,'ICE',NULL,false,NULL,'흑당버블티',10,4800,'E0101',2);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-07-25 15:59:08.35','hc_super','2022-03-21 18:39:14.233',true,'HOT/ICE',NULL,true,NULL,'말차라떼',3,3200,'E0101',2),
	 ('hc_super','2021-05-28 15:04:15.91','hc_super','2022-03-21 18:34:21.167',true,'ICE only',NULL,false,NULL,'흑당버블그린티',11,4800,'E0101',2),
	 ('hc_super','2021-05-22 23:25:10.693','hc_super','2022-03-21 18:34:21.167',true,'ICE only',NULL,false,NULL,'오레오초코라떼',9,3900,'E0101',2),
	 ('hc_super','2021-05-22 22:58:24.88','hc_super','2021-07-25 18:15:17.45',true,'HOT/ICE',NULL,true,NULL,'말차라떼',3,3200,'E0102',2),
	 ('hc_super','2021-05-22 23:00:35.133','hc_super','2022-03-21 18:34:21.167',true,'ICE only',NULL,false,NULL,'딸기라떼',2,3500,'E0101',2),
	 ('hc_super','2021-07-25 16:00:49.08','hc_super','2022-03-21 18:34:21.167',true,'HOT/ICE',NULL,true,NULL,'민트초코라떼',8,3500,'E0101',2),
	 ('hc_super','2021-05-22 22:57:11.75','hc_super','2022-03-21 18:34:21.167',true,'HOT/ICE',NULL,true,NULL,'오곡라떼',5,3300,'E0101',2),
	 ('hc_super','2021-07-25 16:04:40.727','hc_super','2022-03-21 18:34:21.167',true,'HOT/ICE',NULL,true,NULL,'토피넛라떼',7,3800,'E0101',2),
	 ('hc_super','2021-07-25 15:58:11.4','hc_super','2022-03-21 18:34:21.163',true,'HOT/ICE',NULL,true,NULL,'초코라떼',1,3200,'E0101',2),
	 ('hc_super','2021-05-28 15:02:48.903','hc_super','2022-03-21 18:34:21.167',true,'ICE only',NULL,false,NULL,'흑당버블밀크티',12,4800,'E0101',2);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-05-22 23:01:40.527','hc_super','2022-03-21 18:57:44.003',true,'딸기+바나나',NULL,false,NULL,'딸기바나나주스',9,3800,'E0101',5),
	 ('hc_super','2021-05-22 23:04:41.717','hc_super','2022-03-21 18:57:44.003',true,'딸기+얼음',NULL,false,NULL,'딸기주스',8,3800,'E0101',5),
	 ('hc_super','2021-05-22 23:06:42.573','hc_super','2022-03-21 18:57:44.003',true,'라임/자몽/청포도',NULL,false,NULL,'라임 모히또(무알콜)',7,3800,'E0101',5),
	 ('hc_super','2021-05-22 23:08:21.297','hc_super','2022-03-21 18:57:44.003',true,'ICE only',NULL,false,NULL,'레몬에이드',3,3500,'E0101',5),
	 ('hc_super','2021-05-22 23:09:39.53','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'레몬진저티',16,4000,'E0101',5),
	 ('hc_super','2021-05-22 23:10:33.09','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'레몬 Tea',12,3500,'E0101',5),
	 ('hc_super','2021-05-22 23:19:14.523','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'사과유자티',17,4000,'E0101',5),
	 ('hc_super','2021-05-22 23:21:40.777','hc_super','2022-03-21 18:57:44.003',true,'ICE only',NULL,false,NULL,'복숭아 아이스티',2,3000,'E0101',5),
	 ('hc_super','2021-05-22 23:23:12.057','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'얼그레이 Tea',11,3000,'E0101',5),
	 ('hc_super','2021-05-22 23:24:05.427','hc_super','2022-03-21 18:57:44.003',true,'오곡+바나나',NULL,false,NULL,'오곡바나나주스',10,3800,'E0101',5);
INSERT INTO public.menu (created_by,created_date,updated_by,updated_date,cold,description,discount_price,hot,marketing,"name",order_no,price,status,category_id) VALUES
	 ('hc_super','2021-05-22 23:26:15.353','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'유자 Tea',13,3500,'E0101',5),
	 ('hc_super','2021-05-22 23:27:45.367','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'자몽블랙 Tea',15,4000,'E0101',5),
	 ('hc_super','2021-05-22 23:29:59.21','hc_super','2022-03-21 18:57:44.003',true,'레몬/자몽/청포도',NULL,false,NULL,'자몽에이드',4,3500,'E0101',5),
	 ('hc_super','2021-05-22 23:32:18.07','hc_super','2022-03-21 18:57:44.007',true,'HOT/ICE',NULL,true,NULL,'자몽 Tea',14,3500,'E0101',5),
	 ('hc_super','2021-07-25 17:52:02.647','hc_super','2022-03-21 18:57:44.003',true,'ICE only',NULL,false,NULL,'청포도에이드',5,3500,'E0101',5),
	 ('hc_super','2021-07-25 17:53:13.83','hc_super','2022-03-21 18:57:44.003',true,'ICE only',NULL,false,NULL,'체리콕',1,3000,'E0101',5),
	 ('hc_super','2021-07-25 17:53:58.26','hc_super','2022-03-21 18:57:44.003',true,'ICE only',NULL,false,NULL,'힘이나 에이드',6,0,'E0101',5),
	 ('hc_super','2021-05-28 15:09:09.347','hc_super','2022-03-21 18:23:25.367',true,'ICE only',NULL,false,NULL,'콜드브루',1,3300,'E0101',6),
	 ('hc_super','2021-07-25 15:51:15.72','hc_super','2022-03-21 18:23:25.367',true,'ICE',NULL,false,NULL,'크림콜드브루',3,4300,'E0101',6),
	 ('hc_super','2021-07-25 15:52:20.283','hc_super','2022-03-21 18:23:25.367',true,'ICE',NULL,false,NULL,'콜드브루 라떼',2,3800,'E0101',6);

-- =============================================================================
-- Step 2: Insert image data
-- =============================================================================
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('f57febd1-9a45-4d78-a328-eef009bafc6a.png','hc_super','2021-05-25 10:05:39.067','말차라떼(I).jpg',108,'menu',1),
	 ('77771a4e-13f6-4454-bde7-b7e9755fa1b5.png','cnsqo123','2025-09-05 13:58:25.921946','workflow-editor.png',9,'store',1),
	 ('b7fbfbed-1bc7-411c-86a8-e8d884fba93f.png','cnsqo123','2025-09-05 13:59:07.527157','1b13b89188400400dhbt5]viexffzg623.png',9,'store',2),
	 ('c0eac14d-7667-4650-98cb-794f75af3ecb.png','cnsqo123','2025-09-05 13:59:07.538661','힘이나는커피생활_웹호스팅정보.png',9,'store',4),
	 ('90e7c457-499b-4e8c-a63c-f16b797f5b44.png','cnsqo123','2025-09-05 13:58:25.913461','jira-issues.png',9,'store',3),
	 ('fa082d56-d67f-4716-8c11-a47dfdaaef19.png','cnsqo123','2025-09-05 16:20:06.781351','스크린샷 2025-09-03 164746.png',7,'store',1),
	 ('456c2ac8-06de-4bb8-bef1-90a159ce1c44.png','cnsqo123','2025-09-16 10:34:31.510442','스크린샷 2025-08-29 101938.png',60,'store',1),
	 ('3d022e8b-bd64-4ca8-a894-0a63aebdeb04.png','hc_super','2025-10-21 15:13:17.155658','2022-10-13 (15).png',39,'event',1),
	 ('8258f80a-3905-4c4f-9d5c-fd72412bf036.jpg','hc_super','2025-09-29 13:38:54.624544','dummy.jpg',7,'event',1),
	 ('dc608720-c793-4687-ac29-cc3a88b4c09a.jpg','hc_super','2025-09-29 13:39:15.048807','dummy.jpg',8,'event',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('74ec0962-6122-4c44-aa46-cefabf9bea83.jpg','hc_super','2025-09-29 13:45:02.937805','dummy.jpg',62,'store',1),
	 ('0c3280c3-7d6e-4aa9-86a9-1aaf2c05f170.png','hc_super','2025-10-01 14:51:22.077272','workflow-editor.png',2,'new-menu',1),
	 ('c0d88e7b-9630-4b9a-a257-2da9abfeb89b.png','hc_super','2025-10-01 14:52:08.379136','workflow-editor.png',4,'new-menu',1),
	 ('1bcc93fd-09f8-470b-9b3e-1fd8742f07ea.png','cnsqo123','2025-10-01 15:25:24.911148','1b13b89188400400dhbt5]viexffzg624.png',63,'store',1),
	 ('f391f397-84f5-4646-9f18-ce2ceb92ab0f.png','hc_super','2025-10-01 17:48:32.672407','스크린샷 2025-02-11 085553.png',13,'event',1),
	 ('bccde00d-eae8-4c58-b0c5-5fe29c55a9d0.png','hc_super','2025-10-21 15:13:48.465145','2022-10-13 (15).png',40,'event',1),
	 ('30c7ac2e-5e8d-4280-b7ca-808b15b93250.png','hc_super','2025-10-21 15:14:09.444853','2022-10-13 (15).png',41,'event',1),
	 ('32f56300-ce97-43b1-a492-9af876ee39ec.png','hc_super','2025-10-21 15:15:03.45113','2022-10-13 (15).png',42,'event',1),
	 ('a60dac47-13b8-4f10-aa9d-ccd075a54d99.jpg','hc_super','2025-10-02 14:11:01.045889','(ySgJhG.jpg',16,'event',1),
	 ('ba02f328-3af9-4824-b006-8dd33bd0c0da.png','hc_super','2025-10-02 14:16:56.193684','스크린샷 2025-02-11 085553.png',17,'event',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('6f3135ca-031b-43f9-8ab0-8275397b2703.jpg','hc_super','2025-10-02 14:19:54.45751','(ySgJhG.jpg',18,'event',1),
	 ('c19447d1-01b1-4916-8a5b-2178e673b56c.png','hc_super','2025-10-02 14:30:36.542303','스크린샷 2025-03-18 163158.png',19,'event',1),
	 ('31702593-3e7f-4951-ad58-24788633f5ad.png','hc_super','2025-10-21 15:52:35.511435','2022-10-13 (11).png',5,'new-menu',1),
	 ('b4cc20da-6f08-4716-9d6c-41d1be212463.jpg','hc_super','2025-10-02 15:00:24.37569','test.jpg',21,'event',1),
	 ('ae112888-e954-4517-b128-2934b5f60895.png','hc_super','2025-10-21 17:39:45.966051','2022-10-13 (15).png',43,'event',1),
	 ('92b58e24-c6fb-436e-b0a3-8cb0d0bde902.jpg','hc_super','2025-10-14 13:19:53.384638','(mo3)-select12.jpg',22,'event',1),
	 ('394c5624-4cb4-491a-ad3a-b9124a8a5408.png','hc_super','2025-10-21 17:51:51.562673','2022-10-13 (14).png',44,'event',1),
	 ('e556c9ae-f771-42cc-816e-bc89347c22aa.jpg','hc_super','2025-10-14 17:30:36.24757','dummy.jpg',23,'event',1),
	 ('3aaf002b-095a-4933-a0f9-2477a2d34ace.png','hc_super','2025-10-21 18:14:31.144957','2022-10-13 (3).png',3,'new-menu',1),
	 ('16da577a-fadf-449c-a0f1-15e106b1ecbb.jpg','hc_super','2025-10-14 17:33:04.824996','dummy.jpg',67,'store',2);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('63284b0d-5416-4949-accb-327dcbae145c.png','hc_super','2025-10-14 17:33:53.301319','2022-10-13 (11).png',67,'store',1),
	 ('e57b6dcf-3e77-4889-bc2c-f74f2e1024fe.jpg','hc_super','2025-10-14 17:33:53.317182','test.jpg',67,'store',3),
	 ('f2f79c53-1118-4c73-9e72-804eb5250b2e.png','hc_super','2025-10-21 18:14:45.334352','2022-10-13 (10).png',7,'new-menu',1),
	 ('e60f0680-2b79-4e4c-84f2-96c7e97e5d62.png','hc_super','2025-10-14 18:10:24.909262','2022-10-13 (11).png',24,'event',1),
	 ('a0558d3e-9df2-42b5-85af-fe18b6609389.png','hc_super','2025-10-23 09:22:47.402495','2022-10-13 (9).png',9,'new-menu',1),
	 ('884d8583-14e6-482f-ab38-01973e7aa42a.png','hc_super','2025-10-23 13:58:39.811498','2022-10-13 (11).png',47,'event',1),
	 ('73f2fe1a-07d0-4d1c-bd96-cee4f20a7d6d.png','hc_super','2025-10-15 09:04:38.465581','2022-10-13 (15).png',27,'event',1),
	 ('949f8ea9-a1c6-4e6a-aa98-fca8b550ee36.png','hc_super','2025-10-15 09:06:48.105144','2022-10-13 (12).png',28,'event',1),
	 ('0cc07270-42ef-4eb0-9ade-c1a85764b41d.png','hc_super','2025-10-15 09:07:02.132638','2022-10-13 (15).png',29,'event',1),
	 ('19c58e88-1f25-4e49-a290-409692b0b3ba.png','hc_super','2025-10-16 09:48:44.536486','2022-10-13 (15).png',6,'event',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('480c6de0-febf-4a9b-b7ce-1d3d0209b197.png','cnsqo123','2025-10-01 15:25:24.921754','1b13b89188400400dhbt5]viexffzg623.png',63,'store',3),
	 ('8b40162b-9afc-44e8-aea3-e577d9763102.png','cnsqo123','2025-10-01 15:25:24.94314','jira-issues.png',63,'store',2),
	 ('6df37efa-d3c0-402a-860c-29b5ffe210a4.jpg','cnsqo123','2025-10-16 16:05:09.033465','search.pstatic.jpg',70,'store',1),
	 ('188fe5ee-c4ef-488f-970e-8d4a940a0484.png','hc_super','2025-10-16 16:38:47.956734','2022-10-13 (11).png',20,'event',1),
	 ('cc8972ce-1e2a-4428-83f9-bdbd237d73dd.png','hc_super','2025-10-16 17:58:01.882782','2022-10-13 (15).png',37,'event',1),
	 ('ae81632b-6419-4c75-ada5-50b49398af8b.png','hc_super','2025-10-17 08:58:43.651012','2022-10-13 (15).png',35,'event',1),
	 ('6d2a0aaf-10e1-4b44-9652-8caeb1d55b3b.png','hc_super','2025-10-17 08:59:15.127246','2022-10-13 (11).png',38,'event',1),
	 ('11195d07-c876-4f21-ae7c-c15e65a1dc28.png','hc_super','2025-10-23 13:58:44.230244','2022-10-13 (11).png',48,'event',1),
	 ('79e1b954-1109-4e79-876f-f148635fb5fd.png','hc_super','2025-10-23 13:59:08.009069','2022-10-13 (11).png',49,'event',1),
	 ('f3f3b3d5-e3d2-4627-8d85-d1ccc475db3a.png','hc_super','2025-10-23 13:59:11.870025','2022-10-13 (11).png',50,'event',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('3169b372-f1c8-4487-b341-0562535e4ca9.png','hc_super','2025-10-23 17:54:18.992461','2022-10-13 (11).png',8,'new-menu',1),
	 ('a147adae-7ccb-4e94-b578-28e9c1ead5fe.png','hc_super','2025-10-24 11:12:15.634887','2022-10-13 (12).png',51,'event',1),
	 ('9d6c0022-d1d4-4799-b229-9ea1f99ef34c.png','hc_super','2025-10-24 13:27:45.065088','2022-10-13 (14).png',52,'event',1),
	 ('30853b3b-e9ff-4e2b-8e95-bd6dc352fc21.png','hc_super','2025-10-24 14:18:10.898688','2022-10-13 (9).png',53,'event',1),
	 ('9bdb3aed-b936-4a99-b9f8-105f1b933b71.jpg','cnsqo123','2025-10-24 14:18:32.300107','search.pstatic.jpg',71,'store',1),
	 ('cf2569ae-4ab0-4318-b3c2-23c9aec229a9.png','hc_super','2025-10-27 15:45:44.772896','2022-10-13 (14).png',54,'event',1),
	 ('e6cb742d-f964-45c3-808a-5589d5908a82.png','hc_super','2021-05-25 10:02:00.643','유자티(I).jpg',154,'menu',1),
	 ('f7359fe0-2dad-457e-8c64-c2a06aa36ff0.png','hc_super','2021-05-25 10:02:55.977','얼그레이(I).jpg',152,'menu',1),
	 ('999debbb-c0a2-4ccc-9959-3fd76504a8dc.png','hc_super','2021-07-25 15:21:12.833','02아메리카노 ICE.png',88,'menu',1),
	 ('fefcfad5-10f7-4f30-997f-1412d1354ce7.png','hc_super','2021-07-25 15:22:12.25','04꿀아메리카노 ICE.png',89,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('f09adbe2-5822-41ce-8628-d1c04c365666.png','hc_super','2021-07-25 15:24:16.38','01아메리카노 HOT.png',87,'menu',1),
	 ('fc24dbde-4cfa-4f7e-a543-ad76ea82d52a.png','hc_super','2021-07-25 15:25:37.13','06헤이즐넛)바닐라아메리카노 ICE.png',90,'menu',1),
	 ('432137c9-d58b-4c5e-9aeb-122a720653b6.png','hc_super','2021-07-25 15:25:53.343','06헤이즐넛)바닐라아메리카노 ICE.png',91,'menu',1),
	 ('86efdef7-f226-4e2e-910d-b82365b90dcc.png','hc_super','2021-07-25 15:28:28.493','08카페라떼 HOT.png',92,'menu',1),
	 ('74ae654c-7f38-4aea-a707-663099116dd7.png','hc_super','2021-07-25 15:29:06.01','13바닐라라떼 ICE.png',93,'menu',1),
	 ('db035215-3897-4f39-b88b-7ec2187d79d1.png','hc_super','2021-07-25 15:29:23.893','15헤이즐넛라떼 ICE.png',94,'menu',1),
	 ('f5a65fcf-4e9c-485a-b8e5-cecf70382127.png','hc_super','2021-07-25 15:30:02.37','21연유라떼 ICE.png',95,'menu',1),
	 ('a8cb4520-0d53-4039-82b7-a254b058510f.png','hc_super','2021-07-25 15:31:26.153','25티마리수라떼.png',97,'menu',1),
	 ('f447f145-7dbb-4e37-a9dc-e79178e85d1e.png','hc_super','2021-07-25 15:32:10.003','11카푸치노 ICE.png',98,'menu',1),
	 ('8832e7b6-ac17-45b7-a4cc-cfb8700d044f.png','hc_super','2021-07-25 15:33:17.267','24큐브라떼.png',101,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('406d0633-86a2-4c3a-b935-7d16a1295fed.png','hc_super','2021-07-25 15:33:30.673','17카라멜마끼아또 ICE.png',100,'menu',1),
	 ('2f4fa559-dd6a-aff-90ab-1438d3aae984.png','hc_super','2021-07-25 15:33:43.133','19카페모카 ICE.png',99,'menu',1),
	 ('2ed51061-c571-47c2-a0fc-f6064395f068.png','hc_super','2021-07-25 15:42:41.433','07힘이나커피.png',102,'menu',1),
	 ('450f03be-4500-4e19-8dc4-324976032f99.png','hc_super','2021-07-25 15:46:30.49','23민트카페모카 ICE.png',103,'menu',1),
	 ('b2f1569e-c8c2-49fe-a4c4-487a92d7eab1.png','hc_super','2021-07-25 15:49:17.16','26달고나라떼.png',104,'menu',1),
	 ('904c3293-7a39-4fd7-a0d7-ad47cdcbed18.png','hc_super','2021-07-25 15:50:23.877','01콜드브루.png',161,'menu',1),
	 ('e28860d9-3d5a-4e30-b08a-1eaf1617141d.png','hc_super','2021-07-25 15:51:15.72','03크림콜드브루.png',162,'menu',1),
	 ('eb14433f-7fbf-4030-a6ab-eedc53ac15da.png','hc_super','2021-07-25 15:52:20.283','02콜드브루라떼.png',163,'menu',1),
	 ('5085a927-97bf-4f90-83d8-d3f56bf67608.png','hc_super','2021-07-25 15:58:11.4','02초코라떼 ICE.png',114,'menu',1),
	 ('da968cc7-1a79-4470-af67-7d549ebc9b83.png','hc_super','2021-07-25 15:59:08.35','04녹차라떼 ICE.png',115,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('ce20f342-7e42-4f0b-95c1-c344f54dfa7b.png','hc_super','2021-07-25 15:59:44.63','06오곡라떼 ICE.png',107,'menu',1),
	 ('23c17760-0232-4076-aaae-b3bc85fa125e.png','hc_super','2021-07-25 16:00:49.08','07민트초코라떼 HOT.png',116,'menu',1),
	 ('9e5b9d26-4059-4ac2-b71a-fcdf7c45a365.png','hc_super','2021-07-25 16:02:33.267','10홍차라떼 ICE.png',117,'menu',1),
	 ('06a517ca-92aa-4e63-b790-66859f0a04fa.png','hc_super','2021-07-25 16:03:08.547','12고구마라떼 ICE.png',106,'menu',1),
	 ('984f96a3-12a0-4072-a224-e1113fd33782.png','hc_super','2021-07-25 16:04:40.75','14토피넛라떼 ICE.png',118,'menu',1),
	 ('640e9056-4383-49ff-8642-c4ca0c356003.png','hc_super','2021-07-25 16:05:11.567','15딸기라떼.png',109,'menu',1),
	 ('e8bacc8e-3718-4112-a8be-1cedf7b04ff9.png','hc_super','2021-07-25 16:05:40.5','16오레오초코라떼.png',110,'menu',1),
	 ('59a3119d-c6a4-4471-ab6b-f644b3e714f4.png','hc_super','2021-07-25 16:06:37.66','19흑당버블밀크티.png',112,'menu',1),
	 ('b5ab233e-a174-4b23-81a5-916928cc5396.png','hc_super','2021-07-25 16:06:49.463','20흑당버블그린티.png',113,'menu',1),
	 ('cb7c4f6a-cbbf-4d79-8496-7065535e755a.png','hc_super','2021-07-25 16:07:53.113','18흑당버블티.png',119,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('2c980373-fa1f-482e-8087-aa91e0e37046.png','hc_super','2021-07-25 16:52:14.563','01흑임자크림라떼 (2).png',120,'menu',1),
	 ('fcf19e79-8d0d-4ff8-9cb9-293c7d0ce340.png','hc_super','2021-07-25 16:53:39.4','03힘나쇼(뱅쇼) (2).png',121,'menu',1),
	 ('73fe1527-1d62-4288-8a0d-c7f3a6e0b6fc.png','hc_super','2021-07-25 16:54:27.597','02힘나리아(상그리아) (2).png',122,'menu',1),
	 ('6800aec7-3134-4604-89e5-d3558dca4f01.png','hc_super','2021-07-25 16:55:15.18','04월남커피(코코넛커피스무디) (2).png',123,'menu',1),
	 ('b7466546-5571-4fb3-9040-6107bc90a19c.png','hc_super','2021-07-25 16:59:40.03','21딸기주스.png',145,'menu',1),
	 ('8214f4fc-b987-40d9-9a57-c7275b2a03fa.png','hc_super','2021-07-25 16:59:55.183','22딸기바나나주스.png',144,'menu',1),
	 ('c5e92630-fb9b-444e-a65d-ebd36a0b93ac.png','hc_super','2021-07-25 17:00:32.787','14딸기요거트스무디.png',142,'menu',1),
	 ('9959cb3b-9e59-4022-b193-dc125a28ff2a.png','hc_super','2021-07-25 17:01:34.85','01밀크퐁프라페.png',129,'menu',1),
	 ('51221a1e-675d-490a-aff9-4a7c2c7ee42e.png','hc_super','2021-07-25 17:02:02.53','12민트초코프라페.png',140,'menu',1),
	 ('34f02a82-5ebc-4435-86dc-1e95cba2f500.png','hc_super','2021-07-25 17:02:16.423','10녹차프라페.png',138,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('dfecbf7b-0695-4c0b-bb85-e540e3f37462.png','hc_super','2021-07-25 17:04:23.29','24오곡바나나주스.png',153,'menu',1),
	 ('6f494f97-00b0-4fa6-8bf4-725d9d4cce66.png','hc_super','2021-07-25 17:10:31','02딸기퐁프라페.png',130,'menu',1),
	 ('33922978-ee46-49f5-8322-0cde98d8f339.png','hc_super','2021-07-25 17:11:49.793','03바나나퐁프라페.png',131,'menu',1),
	 ('e06f2145-b0b6-4177-b2f5-2b0bbf2ba334.png','hc_super','2021-07-25 17:13:48.653','04오곡퐁프라페.png',132,'menu',1),
	 ('c54e5963-6b2f-4246-86b1-cb3f3e7504c8.png','hc_super','2021-07-25 17:14:59.13','05바나나프라페.png',133,'menu',1),
	 ('5fbd0ae6-2d44-42b4-a34a-e4f7dbf1d3cc.png','hc_super','2021-07-25 17:42:54.283','06딸기바나나프라페.png',134,'menu',1),
	 ('ce0ae6c1-b48d-487f-a34d-8ad488323ad8.png','hc_super','2021-07-25 17:43:49.097','07초코바나나프라페.png',135,'menu',1),
	 ('5feef89f-b9d3-444f-8eb4-3aac913614b2.png','hc_super','2021-07-25 17:44:44.923','08쿠키프라페 (1).png',136,'menu',1),
	 ('e2c89538-31c8-49ee-9e06-d8986d527d59.png','hc_super','2021-07-25 17:45:39.867','09초코프라페 (1).png',137,'menu',1),
	 ('62cf7d74-7291-4a5e-9d0f-ec032a1f735b.png','hc_super','2021-07-25 17:46:27.403','11커피프라페.png',139,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('d4bd02e8-50ba-48aa-852b-d09e2dc340e2.png','hc_super','2021-07-25 17:48:21.4','13플레인요거트스무디.png',141,'menu',1),
	 ('0deaabb1-8b73-4632-9565-7a503bf7e6d2.png','hc_super','2021-07-25 17:49:29.04','15망고요거트스무디 (1).png',126,'menu',1),
	 ('dc862256-ee60-426e-9878-3e30c549f6ca.png','hc_super','2021-07-25 17:49:55.953','16블루베리요거트스무디.png',143,'menu',1),
	 ('46a820f7-7f43-4d09-89ab-a26bd47dbe02.png','hc_super','2021-07-25 17:51:05.853','01레몬에이드.png',147,'menu',1),
	 ('fc3ff709-2dec-4903-8dce-8070ee00e5b2.png','hc_super','2021-07-25 17:51:30.223','02자몽에이드.png',156,'menu',1),
	 ('0edd0eea-4070-4b3a-93ff-757ed6f23683.png','hc_super','2021-07-25 17:52:02.65','03청포도에이드.png',158,'menu',1),
	 ('227f0fc4-e642-4ed0-b72e-6c25b4bcdd70.png','hc_super','2021-07-25 17:52:20.42','04복숭아아이스티.png',151,'menu',1),
	 ('8f07797f-42fd-4219-bfb6-90f0ee9b8b90.png','hc_super','2021-07-25 17:52:50.907','05라임모히또.png',146,'menu',1),
	 ('96907373-2053-4789-90a2-06146521f389.png','hc_super','2021-07-25 17:53:13.83','08체리콕.png',159,'menu',1),
	 ('ec5199e3-7ab9-42fa-8e88-603f9d12caba.png','hc_super','2021-07-25 17:53:58.26','09힘이나에이드.png',160,'menu',1);
INSERT INTO public.image (file_uuid,created_by,created_date,file_name,menu_id,menu_type,"ordering") VALUES
	 ('bebb6cd6-af22-4f05-bee1-bb87ee090c48.png','hc_super','2021-07-25 17:55:19.893','29레몬진저티 ICE.png',148,'menu',1),
	 ('62b4af39-7142-4c16-96c6-6cc19394b51f.png','hc_super','2021-07-25 17:55:34.027','27사과유자티 ICE.png',150,'menu',1),
	 ('beb734b3-3a4b-41e4-baa0-1a5f304e8c56.png','hc_super','2021-07-25 17:57:07.837','25레몬차 ICE.png',149,'menu',1),
	 ('fbbfc91a-5336-4371-a628-68f89487ef9e.png','hc_super','2021-07-25 17:57:29.39','31자몽블랙티 ICE.png',155,'menu',1),
	 ('37478efe-c638-4474-b51b-9284ec8b7db5.png','hc_super','2021-07-25 17:58:06.283','23자몽차 ICE.png',157,'menu',1);
