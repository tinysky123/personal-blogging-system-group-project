import express from "express";
import { updateArticleTags, addArticleTags, removeArticleTags } from "../../../../data/articles/tags/tags-dao.js";
import { getArticleAllTags } from "../../../../data/articles/tags/tags-dao.js";
import { getAllTags } from "../../../../data/articles/tags/tags-dao.js";
import { autoTag } from "../../../../data/util.js";
import * as yup from 'yup';

const router = express.Router();

// Yup validation schemas
/**
 * Validation schema for article ID parameter
 * Ensures articleId is a positive number
 */
const artSchema = yup.object().shape({
  articleId: yup.number().positive('ArticleId should be positive').required('articleId is required').typeError('articleId must be a number')
});

/**
 * Validation schema for article tags operations
 * Validates both articleId and tags array
 */
const artTagSchema = yup.object().shape({
  articleId: yup.number().positive('ArticleId should be positive').required('articleId is required').typeError('articleId must be a number'),
  tags: yup.array().min(1).required('An effective array of tags is necessary')
});

/**
 * Validation schema for tag suggestion request
 * Validates text input for auto-tagging
 */
const suggestSchema = yup.object().shape({
  text: yup.string().required('Text is required')
});

/**
 * GET /api/articles/tags
 * Retrieve all available tags in the system
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all tags from database
    const tags = await getAllTags();
    res.status(200).json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * POST /api/articles/tags/suggest
 * Generate suggested tags based on provided text using auto-tagging functionality
 */
router.post('/suggest', async (req, res) => {
  const { text } = req.body;
  
  // Validate request body
  try {
    await suggestSchema.validate({ text: text });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    // Use auto-tagging utility to generate suggested tags
    const autoTagged = await autoTag(text);
    const tags = autoTagged.map(t => t.tag);
    
    res.json({
      status: 'success',
      data: { tags }
    });
  } catch (error) {
    console.error('Auto tag error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate tags' });
  }
});

/**
 * PUT /api/articles/:articleId/tags
 * Update all tags for a specific article (replaces existing tags)
 */
router.put("/:articleId/tags", async (req, res) => {
  const { tags } = req.body;
  
  // Validate request parameters and body
  try {
    await artTagSchema.validate({ articleId: req.params.articleId, tags: tags });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  
  const articleId = parseInt(req.params.articleId);

  try {
    // Update article tags in database
    const result = await updateArticleTags(articleId, tags);
    res.status(200).json(result);
  } catch (error) {
    console.error("An error occurred when updating the article tags:", error);
    res.status(500).json({ error: "A server error occurred when updating the article tags" });
  }
});

/**
 * POST /api/articles/:articleId/tags
 * Add new tags to a specific article (preserves existing tags)
 */
router.post("/:articleId/tags", async (req, res) => {
  const { tags } = req.body;
  
  // Validate request parameters and body
  try {
    await artTagSchema.validate({ articleId: req.params.articleId, tags: tags }, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  
  const articleId = parseInt(req.params.articleId);

  try {
    // Add new tags to article
    await addArticleTags(articleId, tags);
    res.status(204).end();
  } catch (error) {
    console.error("An error occurred when adding the article tags:", error);
    res.status(500).json({ error: "A server error occurred when adding the article tags" });
  }
});

/**
 * DELETE /api/articles/:articleId/tags
 * Remove specific tags from an article
 */
router.delete("/:articleId/tags", async (req, res) => {
  const { tags } = req.body;
  
  // Validate request parameters and body
  try {
    await artTagSchema.validate({ articleId: req.params.articleId, tags: tags }, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  
  const articleId = parseInt(req.params.articleId);

  try {
    // Remove specified tags from article
    await removeArticleTags(articleId, tags);
    res.status(204).end();
  } catch (error) {
    console.error("An error occurred when removing the article tags:", error);
    res.status(500).json({ error: "A server error occurred when removing the article tags" });
  }
});

/**
 * GET /api/articles/:articleId/tags
 * Retrieve all tags associated with a specific article
 */
router.get("/:articleId/tags", async (req, res) => {
  // Validate article ID parameter
  try {
    await artSchema.validate({ articleId: req.params.articleId }, { abortEarly: false });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    // Fetch all tags for the specified article
    const tags = await getArticleAllTags(req.params.articleId);
    const tagNames = tags.map(tag => tag.tag_name);
    
    res.status(200).json({
      status: "success",
      data: tagNames
    });
  } catch (error) {
    console.error("An error occurred when getting the article tags:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;