/**
 * This file contains a dummy DAO for the "Messages" database. You should
 * create your own DAOs for your project, and get rid of this one.
 */

import { getDatabase } from "../../database.js";
import { deleteByFieldValue, insertDataFromJson, searchTable, searchTable2,executeParameterizedSql } from "../../sql-util.js";



export async function updateArticleTags(articleId, tags) {
    const db =await getDatabase();
    const deleteConditions = [
        { field: 'article_id', value: articleId, operator: '=' }
    ];
    await deleteByFieldValue(db, 'article_tags', deleteConditions);

    for (const tag of tags) {
        const searchConditions = [
            { field: 'tag_name', value: tag, operator: '=' }
        ];
        const existingTags = await searchTable2(db, 'tags', searchConditions, []);

        let tagId;
        if (existingTags.length > 0) {
            tagId = existingTags[0].tag_id;
        } else {
            try {
                const insertResult = await insertDataFromJson(db, 'tags', { tag_name: tag });
                tagId = insertResult.lastID;
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    const retry = await searchTable(db, 'tags', [
                        { field: 'tag_name', value: tag, operator: '=' }
                    ]);
                    tagId = retry[0]?.tag_id;
                } else {
                    throw err; 
                }
            }
        }
        
        await insertDataFromJson(db, 'article_tags', {
            article_id: articleId,
            tag_id: tagId
        });
    }
    return { success: true };
}


export async function addArticleTags(articleId, tags) {
    const db = await getDatabase();
    for (const tag of tags) {
        const searchConditions = [
            { field: 'tag_name', value: tag, operator: '=' }
        ];
        const existingTags = await searchTable(db, 'tags', searchConditions, []);

        let tagId;
        if (existingTags.length > 0) {
            tagId = existingTags[0].tag_id;
        } else {
            const insertResult = await insertDataFromJson(db, 'tags', { tag_name: tag });
            tagId = insertResult.lastID;
        }


        const existingRelationConditions = [
            { field: 'article_id', value: articleId, operator: '=' },
            { field: 'tag_id', value: tagId, operator: '=' }
        ];
        const existingRelations = await searchTable(db, 'article_tags', existingRelationConditions, []);
        if (existingRelations.length === 0) {
            await insertDataFromJson(db, 'article_tags', {
                article_id: articleId,
                tag_id: tagId
            });
        }
    }
}

export async function removeArticleTags(articleId, tags) {
    const db = await getDatabase();
    for (const tag of tags) {
        const searchConditions = [
            { field: 'tag_name', value: tag, operator: '=' }
        ];
        const existingTags = await searchTable(db, 'tags', searchConditions, []);

        if (existingTags.length > 0) {
            const tagId = existingTags[0].tag_id;
            const deleteConditions = [
                { field: 'article_id', value: articleId, operator: '=' },
                { field: 'tag_id', value: tagId, operator: '=' }
            ];
            await deleteByFieldValue(db, 'article_tags', deleteConditions);
        }
    }
}

export async function getArticleAllTags(articleId) {
    const db = await getDatabase();
    const sql = `
        SELECT t.tag_name 
        FROM article_tags at 
        JOIN tags t ON at.tag_id = t.tag_id 
        WHERE at.article_id = ?
    `;
    return await executeParameterizedSql(db, sql, "all",articleId);
}

export async function getAllTags(){
    const db = await getDatabase();
    return await db.all(
    `SELECT DISTINCT LOWER(tag_name) as tag_name
     FROM tags a 
     INNER JOIN article_tags b ON a.tag_id=b.tag_id 
     INNER JOIN (SELECT article_id FROM articles WHERE is_deleted=0) c ON b.article_id=c.article_id   `
  );
}

