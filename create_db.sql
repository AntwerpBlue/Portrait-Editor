/*
 Navicat Premium Data Transfer

 Source Server         : MyLocalDB
 Source Server Type    : MySQL
 Source Server Version : 80040
 Source Host           : localhost:3306
 Source Schema         : portrait_editor

 Target Server Type    : MySQL
 Target Server Version : 80040
 File Encoding         : 65001

 Date: 22/04/2025 13:58:26
*/

CREATE DATABASE IF NOT EXISTS `portrait_editor` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `portrait_editor`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for image
-- ----------------------------
DROP TABLE IF EXISTS `image`;
CREATE TABLE `image`  (
  `imageName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadTime` datetime NOT NULL,
  `ExpireTime` datetime NOT NULL,
  `UsedProjectID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UploaderID` int NOT NULL,
  PRIMARY KEY (`imageName`) USING BTREE,
  INDEX `ImgUsedbyProj`(`UsedProjectID` ASC) USING BTREE,
  CONSTRAINT `ImgUsedbyProj` FOREIGN KEY (`UsedProjectID`) REFERENCES `request` (`ProjectID`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for request
-- ----------------------------
DROP TABLE IF EXISTS `request`;
CREATE TABLE `request`  (
  `ProjectID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VideoURL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PromptType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PromptContent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UploadTime` datetime NOT NULL,
  `CompleteTime` datetime NULL DEFAULT NULL,
  `Result` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UserID` int NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ThumbNail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `RelightBG` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `TaskID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`ProjectID`) USING BTREE,
  INDEX `USER_FK`(`UserID` ASC) USING BTREE,
  CONSTRAINT `USER_FK` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserID` int NOT NULL,
  `Mail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsAdmin` tinyint NULL DEFAULT NULL,
  PRIMARY KEY (`UserID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for video
-- ----------------------------
DROP TABLE IF EXISTS `video`;
CREATE TABLE `video`  (
  `videoName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadTime` datetime NOT NULL,
  `ExpireTime` datetime NOT NULL,
  `UsedProjectID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UploaderID` int NOT NULL,
  PRIMARY KEY (`videoName`) USING BTREE,
  INDEX `UsedbyProject`(`UsedProjectID` ASC) USING BTREE,
  CONSTRAINT `UsedbyProject` FOREIGN KEY (`UsedProjectID`) REFERENCES `request` (`ProjectID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- View structure for user_project_counts
-- ----------------------------
DROP VIEW IF EXISTS `user_project_counts`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `user_project_counts` AS select `u`.`UserID` AS `UserID`,`u`.`Name` AS `Username`,count(`p`.`ProjectID`) AS `ProjectCount`,max(`p`.`UploadTime`) AS `LastUpdated` from (`user` `u` left join `request` `p` on((`u`.`UserID` = `p`.`UserID`))) group by `u`.`UserID`;

-- ----------------------------
-- View structure for user_projects_view
-- ----------------------------
DROP VIEW IF EXISTS `user_projects_view`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `user_projects_view` AS select `p`.`ProjectID` AS `ProjectID`,`p`.`PromptType` AS `PromptType`,`p`.`PromptContent` AS `PromptContent`,`p`.`UploadTime` AS `UploadTime`,`p`.`CompleteTime` AS `CompleteTime`,`u`.`UserID` AS `UserID`,`u`.`Name` AS `Username`,`u`.`Mail` AS `Mail` from (`request` `p` join `user` `u` on((`p`.`UserID` = `u`.`UserID`)));

SET FOREIGN_KEY_CHECKS = 1;
