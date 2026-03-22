<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { userStore } from '$lib/store/user-store.js';
    import { apiGet, apiPost, apiDelete, apiPatch } from '$lib/api/api.js';
    import { getUserIdCookie, getTokenFromCookie } from '$lib/util.js';
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    // Props passed from parent component
    export let articleId;
    export let articleAuthorId;
    
    // Optional props for recursive component (when used as reply renderer)
    export let parentComment = null;
    export let allComments = [];
    export let depth = 0;
    
    // Optional store props for recursive components
    export let commentVisibilityStore = writable({});
    export let replyCollapsedStore = writable({});
    export let showReplyFormStore = writable({});
    export let replyContentStore = writable({});
    
    // Component state variables
    let currentUser;                // Current logged in user information
    let isCommentsVisible = true;   // Controls visibility of entire comment section
    let content = '';               // Content of new comment being written
    let userId = getUserIdCookie(); // Current user ID retrieved from cookie
    
    // Error message system
    let errorMessage = '';          // Error message text to display
    let showError = false;          // Whether to show error message
    $: {
        console.log('Current User:', currentUser);
        console.log('User ID from cookie:', userId);
        console.log('Token from cookie:', getTokenFromCookie());
    }
    
    // Svelte store to manage comments list reactively
    const comments = writable([]);  // Reactive store containing all comments data
    
    // Local reactive variables that sync with stores
    let commentVisibility = {};     // Controls which comments are visible/hidden
    let replyCollapsed = {};        // Controls which reply threads are collapsed
    let showReplyForm = {};         // Controls which reply forms are shown
    let replyContent = {};          // Stores content of reply forms
    let expandedReplies = {};       // Controls whether all replies are expanded for each comment
    
    // Subscribe to stores and keep local variables in sync
    commentVisibilityStore.subscribe(value => commentVisibility = value);
    replyCollapsedStore.subscribe(value => replyCollapsed = value);
    showReplyFormStore.subscribe(value => showReplyForm = value);
    replyContentStore.subscribe(value => replyContent = value);
    
    /**
     * Helper functions to update stores
     */
    function updateCommentVisibility(updates) {
        commentVisibilityStore.update(current => ({ ...current, ...updates }));
    }
    
    function updateReplyCollapsed(updates) {
        replyCollapsedStore.update(current => ({ ...current, ...updates }));
    }
    
    function updateShowReplyForm(updates) {
        showReplyFormStore.update(current => ({ ...current, ...updates }));
    }
    
    function updateReplyContent(updates) {
        replyContentStore.update(current => ({ ...current, ...updates }));
    }
    
    // Variables for mention functionality
    /**
     * Subscribe to user store changes to get current user information
     */
    userStore.subscribe(value => {
        currentUser = value;
        console.log('User store updated:', value);
    });

    /**
     * Component lifecycle hook - runs when component is first mounted to DOM
     */
    onMount(async () => {
        await loadComments();
        // await loadUsers();
    });

    /**
     * Extract @mentions from text content
     * @param {string} text - Text content to analyze
     * @returns {Array} Array of mentioned usernames
     */
    function extractMentions(text) {
        if (!text) {
            return [];
        }
        
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            const username = match[1];
            // Only include unique mentions
            if (!mentions.includes(username)) {
                mentions.push(username);
            }
        }
        
        return mentions;
    }

    /**
     * Process text content to highlight @mentions
     * @param {string} text - Text content to process
     * @returns {string} HTML with highlighted mentions
     */
   async function highlightMentions(text) {
        // If no text, return empty string
        if (!text) {
            return '';
        }

        const mentionRegex = /@(\w+)/g;
        let match;
        const currentMentions = [];

        while ((match = mentionRegex.exec(text)) !== null) {
            const username = match[1];
            // Only include mentions of users that actually exist
            if (!currentMentions.includes(username)) {
                currentMentions.push(username);
            }
        }

        // If no mentions found, return original text
        if (currentMentions.length === 0) {
            return text;
        }

        try {
            const res = await apiPost("/users/batch-validate-usernames", {usernames: currentMentions});
            const validUsernames = res.data.usernames || [];

            return text.replace(/@(\w+)/g, (match, username) => {
                // Only highlight if the user exists
                if (validUsernames.includes(username)) {
                    return `<span class="mention">@${username}</span>`;
                }
                return match;
            });
        } catch (error) {
            console.error('Error validating usernames:', error);
            // If validation fails, return original text without highlighting
            return text;
        }
    }

    /**
     * Send mention notifications to mentioned users
     * @param {Array} mentionedUsernames - Array of mentioned usernames
     * @param {number} commentId - ID of the comment containing mentions
     */
    async function sendMentionNotifications(mentionedUsernames, commentId) {
        // Check if user is actually logged in
        const cookieUserId = getUserIdCookie();
        const token = getTokenFromCookie();
        
        if (!cookieUserId || !token || mentionedUsernames.length === 0) {
            console.log('No user ID, token, or no mentions, skipping notifications');
            return;
        }
        console.log(`Sending mentions for usernames: ${mentionedUsernames.join(', ')}`);

        for (const username of mentionedUsernames) {
            try {
                // Send notification for each mentioned user
                const notificationData = {
                    senderId: parseInt(cookieUserId),
                    receiverName: username,
                    type: 'mention',
                    articleId: parseInt(articleId),
                    commentId: parseInt(commentId)
                };

                console.log('Sending notification with data:', notificationData);

                const response = await apiPost('/notification', notificationData);

                console.log(`Mention notification sent to @${username} in comment ${commentId}`, response);
            } catch (error) {
                console.error(`Failed to send mention notification for @${username}:`, error);
            }
        }
    }

    /**
     * Send notification to article author when someone comments
     * @param {number} commentId - ID of the new comment
     */
    async function sendCommentNotification(commentId) {
        const cookieUserId = getUserIdCookie();
        const token = getTokenFromCookie();
        
        if (!cookieUserId || !token) {
            console.log('No user ID or token, skipping comment notification');
            return;
        }

        // Don't send notification if commenting on own article
        if (parseInt(cookieUserId) === parseInt(articleAuthorId)) {
            console.log('User commenting on own article, skipping notification');
            return;
        }

        try {
            // Get article author's username
            const articleData = await apiGet(`/articles/${articleId}`);
            if (!articleData ||!articleData.username) {
                console.log('Could not get article author username, skipping notification');
                return;
            }

            const notificationData = {
                senderId: parseInt(cookieUserId),
                receiverName: articleData.username,
                type: 'tag_comment',
                articleId: parseInt(articleId),
                commentId: parseInt(commentId)
            };

            console.log('Sending comment notification with data:', notificationData);
            const response = await apiPost('/notification', notificationData);
            console.log(`Comment notification sent to article author ${articleData.username}`, response);
        } catch (error) {
            console.error(`Failed to send comment notification:`, error);
        }
    }

    /**
     * Send notification to the person being replied to
     * @param {number} parentCommentId - ID of the parent comment
     * @param {number} replyCommentId - ID of the reply comment
     */
    async function sendReplyNotification(parentCommentId, replyCommentId) {
        const cookieUserId = getUserIdCookie();
        const token = getTokenFromCookie();
        
        if (!cookieUserId || !token) {
            console.log('No user ID or token, skipping reply notification');
            return;
        }

        // Find the parent comment to get the user being replied to
        const parentComment = $comments.find(c => c.commentId === parentCommentId);
        if (!parentComment) {
            console.log('Parent comment not found, skipping reply notification');
            return;
        }

        // Don't send notification if replying to own comment
        if (parseInt(cookieUserId) === parseInt(parentComment.userId)) {
            console.log('User replying to own comment, skipping notification');
            return;
        }

        try {
            const notificationData = {
                senderId: parseInt(cookieUserId),
                receiverName: parentComment.username,
                type: 'reply',
                articleId: parseInt(articleId),
                commentId: parseInt(replyCommentId)
            };

            console.log('Sending reply notification with data:', notificationData);
            const response = await apiPost('/notification', notificationData);
            console.log(`Reply notification sent to user ${parentComment.username}`, response);
        } catch (error) {
            console.error(`Failed to send reply notification:`, error);
        }
    }

    /**
     * Fetches comments for the current article from the API
     * Initializes comment visibility states
     */
    async function loadComments() {
        try {
            const data = await apiGet(`/articles/${articleId}/comments`);
            if (data && data.status === 'success') {
                console.log('Comment data:', data.data);
                
                // Initialize visibility states for all comments
                const loadedComments = data.data;
                const visibilityUpdates = {};
                const collapsedUpdates = {};
                const formUpdates = {};
                const contentUpdates = {};
                
                loadedComments.forEach(comment => {
                    // All comments default to visible
                    // Visibility controlled by collapsed state
                    visibilityUpdates[comment.commentId] = true;
                    
                    // All comments default to expanded, no replies collapsed (show first reply)
                    collapsedUpdates[comment.commentId] = false;
                    
                    formUpdates[comment.commentId] = false;
                    contentUpdates[comment.commentId] = '';
                    
                    // Initialize expandedReplies as false (don't expand all replies, just show first)
                    expandedReplies[comment.commentId] = false;
                });
                
                // Update all stores at once
                updateCommentVisibility(visibilityUpdates);
                updateReplyCollapsed(collapsedUpdates);
                updateShowReplyForm(formUpdates);
                updateReplyContent(contentUpdates);
                
                comments.set(loadedComments);
            }
        } catch (error) {
            console.error("Failed to get comments:", error);
        }
    }

    /**
     * Check if user is logged in (with better validation)
     * @returns {boolean} True if user is logged in
     */
    function isUserLoggedIn() {
        const cookieUserId = getUserIdCookie();
        const token = getTokenFromCookie();
        console.log('Login check - UserId:', cookieUserId, 'Token:', token ? 'exists' : 'missing');
        return !!(cookieUserId && token);
    }

    /**
     * Handles submission of a new comment
     */
    async function submitComment() {
        if (!isUserLoggedIn()) {
            showErrorMessage("Please log in before posting a comment");
            return;
        }
        
        if (!content.trim()) {
            return;
        }
        try {
            console.log('Submitting comment:', content);
            
            // API function automatically gets token from cookie
            const response = await apiPost(`/articles/${articleId}/comments`, {
                content: content.trim()
            });
            
            if (response && response.status === 'success') {
                console.log('Comment submitted successfully:', response);
                // Extract mentions and send notifications
                const mentions = extractMentions(content);
                if (mentions.length > 0) {
                    console.log('Found mentions:', mentions);
                    await sendMentionNotifications(mentions, response.data.commentId);
                }
                
                // Send notification to article author
                await sendCommentNotification(response.data.commentId);
                
                content = '';
                updateCommentVisibility({ [response.data.commentId]: true });
                updateShowReplyForm({ [response.data.commentId]: false });
                updateReplyContent({ [response.data.commentId]: '' });
                updateReplyCollapsed({ [response.data.commentId]: false });
                
                // Add new comment to the beginning of the list
                comments.update(c => [response.data, ...c]);
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
            showErrorMessage("Failed to post comment: " + error.message);
        }
    }
    
    /**
     * Handles submission of a reply to a comment
     * @param {number} parentId - ID of the parent comment
     */
    async function submitReply(parentId) {
        if (!isUserLoggedIn()) {
            showErrorMessage("Please log in before posting a reply");
            return;
        }
        
        if (!replyContent[parentId] || !replyContent[parentId].trim()) {
            return;
        }
        
        try {
            console.log('Submitting reply:', replyContent[parentId]);
            
            // API function automatically gets token from cookie
            const response = await apiPost(`/articles/${articleId}/comments`, {
                content: replyContent[parentId].trim(),
                parentId: parentId
            });
            
            if (response && response.status === 'success') {
                console.log('Reply submitted successfully:', response);
                
                // Extract mentions and send notifications
                const mentions = extractMentions(replyContent[parentId]);
                if (mentions.length > 0) {
                    console.log('Found mentions in reply:', mentions);
                    await sendMentionNotifications(mentions, response.data.commentId);
                }
                
                // Send notification to the person being replied to
                await sendReplyNotification(parentId, response.data.commentId);
                
                // Clear reply form and hide it
                updateReplyContent({ [parentId]: '' });
                updateShowReplyForm({ [parentId]: false });
                
                // Initialize visibility for new reply
                updateCommentVisibility({ [response.data.commentId]: true });
                updateShowReplyForm({ [response.data.commentId]: false });
                updateReplyContent({ [response.data.commentId]: '' });
                updateReplyCollapsed({ [response.data.commentId]: false });
                
                // Add new reply to the comments list
                comments.update(c => [...c, response.data]);
            }
        } catch (error) {
            console.error("Failed to post reply:", error);
            showErrorMessage("Failed to post reply: " + error.message);
        }
    }
    
    /**
     * Handles deletion of a comment
     * @param {number} commentId - ID of the comment to delete
     */
    async function deleteComment(commentId) {
        if (confirm("Are you sure you want to delete this comment?")) {
            try {
                const response = await apiDelete(`/articles/${articleId}/comments/${commentId}`);
                console.log("Delete successful", response);
                
                // Remove comment from local list
                comments.update(c => c.filter(comment => comment.commentId !== commentId));
                
                // Clean up tracking objects
                updateCommentVisibility({ [commentId]: undefined });
                updateShowReplyForm({ [commentId]: undefined });
                updateReplyContent({ [commentId]: undefined });
                updateReplyCollapsed({ [commentId]: undefined });
            } catch (error) {
                console.error("Failed to delete comment:", error);
                showErrorMessage("Failed to delete comment: " + error.message);
            }
        }
    }
    
    /**
     * Toggles visibility of the entire comments section
     */
    function toggleAllComments() {
        isCommentsVisible = !isCommentsVisible;
    }
    
    /**
     * Toggles visibility of an individual comment's content
     * @param {number} commentId - ID of the comment to toggle
     */
    function toggleCommentVisibility(commentId) {
        const newVisibility = !commentVisibility[commentId];
        updateCommentVisibility({ [commentId]: newVisibility });
        
        // If hiding a main comment (not a reply), also collapse all its replies
        if (!newVisibility) {
            const comment = $comments.find(c => c.commentId === commentId);
            if (comment && !isReply(comment)) {
                // This is a main comment being hidden, collapse all its replies
                updateReplyCollapsed({ [commentId]: true });
                
                // Also collapse all nested replies
                const allReplies = getAllRepliesForComment(commentId, $comments);
                const collapseUpdates = {};
                allReplies.forEach(reply => {
                    collapseUpdates[reply.commentId] = true;
                });
                if (Object.keys(collapseUpdates).length > 0) {
                    updateReplyCollapsed(collapseUpdates);
                }
            }
        }
    }
    
    /**
     * Toggles visibility of reply form for a specific comment
     * @param {number} commentId - ID of the comment to reply to
     */
    function toggleReplyForm(commentId) {
        const newValue = !showReplyForm[commentId];
        updateShowReplyForm({ [commentId]: newValue });
        
        // Clear reply content when hiding form
        if (!newValue) {
            updateReplyContent({ [commentId]: '' });
        }
    }

    /**
     * Toggles collapse state of replies for a specific comment (control first reply visibility)
     * @param {number} commentId - ID of the comment whose replies to toggle
     */
    function toggleExpandReplies(commentId) {
        updateReplyCollapsed({ [commentId]: !replyCollapsed[commentId] });
        // When collapsing, also collapse expandedReplies
        if (!replyCollapsed[commentId]) {
            expandedReplies[commentId] = false;
            expandedReplies = { ...expandedReplies };
        }
    }

    /**
     * Toggles expansion of all replies for a specific comment (Redbook style)
     * @param {number} commentId - ID of the comment whose replies to toggle
     */
    function toggleExpandAllReplies(commentId) {
        expandedReplies[commentId] = !expandedReplies[commentId];
        expandedReplies = { ...expandedReplies };
    }

    /**
     * Formats a datetime string into a localized, readable format
     * @param {string} dateTimeStr - ISO datetime string from database
     * @returns {string} Formatted datetime string
     */
    function formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    /**
     * Check if a comment is a reply to another comment
     * @param {Object} comment - Comment object
     * @returns {boolean} True if comment is a reply
     */
    function isReply(comment) {
        return comment.parentId !== null && comment.parentId !== undefined;
    }

    /**
     * Get the parent comment for a reply
     * @param {Object} reply - Reply comment object
     * @param {Array} allComments - All comments array
     * @returns {Object|null} Parent comment or null
     */
    function getParentComment(reply, allComments) {
        return allComments.find(comment => comment.commentId === reply.parentId) || null;
    }

    /**
     * Get all direct replies for a specific comment, sorted by creation time
     * @param {number} commentId - ID of the parent comment
     * @param {Array} allComments - All comments array
     * @returns {Array} Array of reply comments
     */
    function getRepliesForComment(commentId, allComments) {
        return allComments
            .filter(comment => comment.parentId === commentId)
            .sort((a, b) => new Date(a.createdDttm) - new Date(b.createdDttm));
    }

    /**
     * Get all replies (including nested replies) for a specific comment
     * @param {number} commentId - ID of the parent comment
     * @param {Array} allComments - All comments array
     * @returns {Array} Array of all reply comments
     */
    function getAllRepliesForComment(commentId, allComments) {
        const directReplies = allComments.filter(comment => comment.parentId === commentId);
        let allReplies = [...directReplies];
        
        // For each direct reply, get its replies too
        directReplies.forEach(reply => {
            const nestedReplies = getAllRepliesForComment(reply.commentId, allComments);
            allReplies = [...allReplies, ...nestedReplies];
        });
        
        return allReplies;
    }

    /**
     * Check if a comment should be visible based on its parent's visibility
     * @param {Object} comment - Comment object
     * @param {Array} allComments - All comments array
     * @returns {boolean} True if comment should be visible
     */
    function shouldCommentBeVisible(comment, allComments) {
        // If it's a main comment, check its own visibility
        if (!isReply(comment)) {
            return commentVisibility[comment.commentId];
        }
        
        // If it's a reply, check if parent is visible
        const parent = getParentComment(comment, allComments);
        if (!parent) {
            return commentVisibility[comment.commentId];
        }
        
        // Check parent's visibility recursively
        return shouldCommentBeVisible(parent, allComments) && commentVisibility[comment.commentId];
    }

    /**
     * Get the root parent comment for any comment
     * @param {Object} comment - Comment object
     * @param {Array} allComments - All comments array
     * @returns {Object} Root parent comment
     */
    function getRootParent(comment, allComments) {
        if (!comment.parentId) {
            return comment;
        }
        const parent = allComments.find(c => c.commentId === comment.parentId);
        if (!parent) {
            return comment;
        }
        return getRootParent(parent, allComments);
    }

    /**
     * Get count of direct replies for a comment
     * @param {number} commentId - ID of the comment
     * @param {Array} allComments - All comments array
     * @returns {number} Number of direct replies
     */
    function getReplyCount(commentId, allComments) {
        return allComments.filter(comment => comment.parentId === commentId).length;
    }

    /**
     * Function to show error message
     */
    function showErrorMessage(message) {
        errorMessage = message;
        showError = true;
        // Auto hide after 5 seconds
        setTimeout(() => {
            showError = false;
            errorMessage = '';
        }, 5000);
    }
    
    /**
     * Function to hide error message
     */
    function hideErrorMessage() {
        showError = false;
        errorMessage = '';
    }

</script>

<!-- Recursive component for rendering replies -->
{#if parentComment && depth > 0}
    {#each getRepliesForComment(parentComment.commentId, allComments) as reply (reply.commentId)}
        {#if commentVisibility[reply.commentId]}
            <div class="reply-item" style="margin-left: {Math.min(depth * 1.5, 10)}rem;">
                <!-- Reply header -->
                <div class="comment-item-header">
                    <!-- Collapse/Expand button for nested replies -->
                    {#if getReplyCount(reply.commentId, allComments) > 0}
                        <button 
                            class="collapse-button reply-collapse-button" 
                            on:click={() => toggleExpandReplies(reply.commentId)}
                            title={replyCollapsed[reply.commentId] ? `Show ${getReplyCount(reply.commentId, allComments)} replies` : 'Hide replies'}
                        >
                            {replyCollapsed[reply.commentId] ? `▶ ${getReplyCount(reply.commentId, allComments)}` : '▼'}
                        </button>
                    {/if}
                    
                    <img 
                        class="comment-avatar reply-avatar" 
                        src={PUBLIC_BASE_URL+reply.avatarUrl || 'https://picsum.photos/200/200?random=' + reply.userId} 
                        alt="avatar" 
                    />
                    
                    <div class="comment-info">
                        <div class="comment-username">{reply.username}</div>
                        <div class="comment-time">{formatDateTime(reply.createdDttm)}</div>
                        <div class="reply-indicator">
                            Replying to {getParentComment(reply, allComments)?.username || 'unknown'}
                        </div>
                    </div>
                    
                    <div class="comment-actions">
                        <button 
                            class="toggle-comment-button" 
                            on:click={() => toggleCommentVisibility(reply.commentId)}
                        >
                            {commentVisibility[reply.commentId] ? 'Hide' : 'Show'}
                        </button>
                        
                        {#if isUserLoggedIn()}
                            <button 
                                class="reply-button" 
                                on:click={() => toggleReplyForm(reply.commentId)}
                            >
                                Reply
                            </button>
                        {/if}
                        
                        {#if ((reply.userId == userId) || (articleAuthorId == userId))}
                            <button class="delete-button" on:click={() => deleteComment(reply.commentId)}>
                                Delete
                            </button>
                        {/if}
                    </div>
                </div>
                
                <!-- Reply content -->
                <div class="comment-content">
                    <div class="comment-text">
                        {#await highlightMentions(reply.content)}
                            <!-- Loading state for mention highlighting -->
                            <p>Loading mentions...</p>
                        {:then highlightedContent}
                            {@html highlightedContent}
                        {:catch error}
                            <!-- Error handling for mention highlighting -->
                            <p>Error highlighting mentions: {error.message}</p>
                        {/await}
                    </div>
                </div>
                
                <!-- Reply form -->
                {#if showReplyForm[reply.commentId]}
                    <div class="reply-form">
                        <textarea 
                            bind:value={replyContent[reply.commentId]}
                            placeholder="Write a reply to {reply.username}... (Use @username to mention someone)" 
                            rows="2"
                        />
                        <div class="reply-form-actions">
                            <button class="post-reply-button" on:click={() => submitReply(reply.commentId)}>
                                Post Reply
                            </button>
                            <button class="cancel-reply-button" on:click={() => toggleReplyForm(reply.commentId)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}
                
                <!-- Recursive replies - unlimited depth -->
                {#if !replyCollapsed[reply.commentId]}
                    <svelte:self 
                        {articleId} 
                        {articleAuthorId}
                        parentComment={reply}
                        {allComments}
                        depth={depth + 1}
                        {commentVisibilityStore}
                        {replyCollapsedStore}
                        {showReplyFormStore}
                        {replyContentStore}
                    />
                {/if}
            </div>
        {/if}
    {/each}
{:else}

<!-- Main comment section container -->
<div class="comment-section">
    <!-- Header with title and toggle button for entire section -->
    <div class="comment-header">
        <h3>Comments</h3>
        <button class="toggle-button" on:click={toggleAllComments}>
            {isCommentsVisible ? 'Hide Comments' : 'Show Comments'}
        </button>
    </div>
    
    <!-- Error message display -->
    {#if showError}
        <div class="error-message" on:click={hideErrorMessage}>
            <span class="error-text">{errorMessage}</span>
            <button class="error-close" on:click={hideErrorMessage}>×</button>
        </div>
    {/if}
    
    <!-- Comment form - only shown to logged-in users -->
    {#if isUserLoggedIn()}
        <div class="comment-form">
            <textarea 
                bind:value={content} 
                placeholder="Add a comment... (Use @username to mention someone)" 
                rows="3"
            />
            <button class="post-button" on:click={submitComment}>Post</button>
        </div>
    {:else}
        <!-- Login prompt for non-authenticated users -->
        <div class="login-reminder">
            Please <a href="/login?redirect={$page.url}&reset=1" >login</a> to post a comment
        </div>
    {/if}
    
    <!-- Comments list - only shown when isCommentsVisible is true -->
    {#if isCommentsVisible}
        {#each $comments as comment (comment.commentId)}
            <!-- Only show root comments (not replies) in main loop -->
            {#if !isReply(comment)}
                <div class="comment-thread">
                    <!-- Main comment -->
                    <div class="comment-item">
                        <!-- Comment header with user info and action buttons -->
                        <div class="comment-item-header">
                            <!-- User avatar -->
                            <img 
                                class="comment-avatar" 
                                src={PUBLIC_BASE_URL+comment.avatarUrl || 'https://picsum.photos/200/200?random=' + comment.userId} 
                                alt="avatar" 
                            />
                            
                            <!-- User information display -->
                            <div class="comment-info">
                                <div class="comment-username">{comment.username}</div>
                                <div class="comment-time">{formatDateTime(comment.createdDttm)}</div>
                            </div>
                            
                            <!-- Action buttons container -->
                            <div class="comment-actions">
                                <!-- Toggle button for individual comment visibility -->
                                <button 
                                    class="icon-button hide-button" 
                                    on:click={() => toggleCommentVisibility(comment.commentId)}
                                    title={commentVisibility[comment.commentId] ? 'Hide Comment' : 'Show Comment'}
                                >
                                    {commentVisibility[comment.commentId] ? '👁️' : '🙈'}
                                </button>
                                
                                <!-- Delete button - only visible to comment author or article author -->
                                {#if ((comment.userId == userId) || (articleAuthorId == userId))}
                                    <button 
                                        class="icon-button delete-button" 
                                        on:click={() => deleteComment(comment.commentId)}
                                        title="Delete Comment"
                                    >
                                        🗑️
                                    </button>
                                {/if}
                            </div>
                        </div>
                        
                        <!-- Comment content - conditionally rendered based on visibility state -->
                        {#if commentVisibility[comment.commentId]}
                            <div class="comment-content">
                                <div class="comment-text">
                                    {#await highlightMentions(comment.content)}
                                        <p>Loading mentions...</p>
                                    {:then highlightedContent}
                                        {@html highlightedContent}
                                    {:catch error}
                                        <p>Error highlighting mentions: {error.message}</p>
                                    {/await}
                                </div>
                                <div class="comment-bottom-actions">
                                    <div class="comment-actions-left">
                                        <!-- Reply button -->
                                        {#if isUserLoggedIn()}
                                            <button 
                                                class="action-button reply-btn" 
                                                on:click={() => toggleReplyForm(comment.commentId)}
                                            >
                                                💬 Reply
                                            </button>
                                        {/if}
                                    </div>
                                    
                                    <!-- Collapse arrow in bottom right (only when replies exist) -->
                                    {#if getReplyCount(comment.commentId, $comments) > 0}
                                        <button 
                                            class="collapse-arrow-button" 
                                            on:click={() => toggleExpandReplies(comment.commentId)}
                                            title={replyCollapsed[comment.commentId] ? `Expand ${getReplyCount(comment.commentId, $comments)} replies` : 'Collapse replies'}
                                        >
                                            {replyCollapsed[comment.commentId] ? '⌄' : '⌃'}
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        {:else}
                            <!-- Hidden comment placeholder -->
                            <div class="comment-content-hidden">
                                <div class="hidden-text">Comment content is hidden</div>
                            </div>
                        {/if}
                        
                        <!-- Reply form - shown when reply button is clicked -->
                        {#if showReplyForm[comment.commentId] && commentVisibility[comment.commentId]}
                            <div class="reply-form">
                                <textarea 
                                    bind:value={replyContent[comment.commentId]}
                                    placeholder="Reply to {comment.username}... (Use @username to mention someone)" 
                                    rows="2"
                                />
                                <div class="reply-form-actions">
                                    <button class="post-reply-button" on:click={() => submitReply(comment.commentId)}>
                                        Post Reply
                                    </button>
                                    <button class="cancel-reply-button" on:click={() => toggleReplyForm(comment.commentId)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        {/if}

                        <!-- Replies container - inside white comment box -->
                        {#if getAllRepliesForComment(comment.commentId, $comments).length > 0 && commentVisibility[comment.commentId] && !replyCollapsed[comment.commentId]}
                            <div class="replies-container">
                            <!-- Display first reply -->
                            {#if getAllRepliesForComment(comment.commentId, $comments).length > 0}
                                {@const allReplies = getAllRepliesForComment(comment.commentId, $comments).sort((a, b) => new Date(a.createdDttm) - new Date(b.createdDttm))}
                                {@const firstReply = allReplies[0]}
                                {@const parentComment = $comments.find(c => c.commentId === firstReply.parentId)}
                                {#if firstReply && commentVisibility[firstReply.commentId]}
                                <div class="reply-item">
                                    <img 
                                        class="reply-avatar" 
                                        src={PUBLIC_BASE_URL+firstReply.avatarUrl || 'https://picsum.photos/200/200?random=' + firstReply.userId} 
                                        alt="avatar" 
                                    />
                                    <div class="reply-content">
                                        <div class="reply-text">
                                            <span class="reply-username">{firstReply.username}</span>
                                            <span class="reply-target">Reply @{parentComment?.username || ''}:</span>
                                            <span class="reply-message">
                                                {#await highlightMentions(firstReply.content)}
                                                    <span>Loading...</span>
                                                {:then highlightedContent}
                                                    {@html highlightedContent}
                                                {:catch error}
                                                    <span>{firstReply.content}</span>
                                                {/await}
                                            </span>
                                        </div>
                                        <div class="reply-actions">
                                            <div class="reply-actions-left">
                                                <span class="reply-time">{formatDateTime(firstReply.createdDttm)}</span>
                                                {#if isUserLoggedIn()}
                                                    <button 
                                                        class="action-button reply-btn" 
                                                        on:click={() => toggleReplyForm(firstReply.commentId)}
                                                    >
                                                        💬 Reply
                                                    </button>
                                                {/if}
                                            </div>
                                            <!-- Delete button for first reply -->
                                            {#if ((firstReply.userId == userId) || (articleAuthorId == userId))}
                                                <button 
                                                    class="action-button delete-btn" 
                                                    on:click={() => deleteComment(firstReply.commentId)}
                                                    title="Delete Reply"
                                                >
                                                    🗑️
                                                </button>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Reply form for first reply -->
                                {#if showReplyForm[firstReply.commentId]}
                                    <div class="reply-form-inline">
                                        <textarea 
                                            bind:value={replyContent[firstReply.commentId]}
                                            placeholder="Reply @{firstReply.username}..." 
                                            rows="2"
                                        />
                                                                                <div class="reply-form-actions">
                                            <button class="post-reply-button" on:click={() => submitReply(firstReply.commentId)}>
                                                Post
                                            </button>
                                            <button class="cancel-reply-button" on:click={() => toggleReplyForm(firstReply.commentId)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            {/if}
                            
                            <!-- Show other replies when expanded -->
                            {#if expandedReplies[comment.commentId]}
                                {#each allReplies.slice(1) as reply (reply.commentId)}
                                    {@const replyParent = $comments.find(c => c.commentId === reply.parentId)}
                                    {#if commentVisibility[reply.commentId]}
                                        <div class="reply-item">
                                            <img 
                                                class="reply-avatar" 
                                                src={PUBLIC_BASE_URL+reply.avatarUrl || 'https://picsum.photos/200/200?random=' + reply.userId} 
                                                alt="avatar" 
                                            />
                                            <div class="reply-content">
                                                <div class="reply-text">
                                                    <span class="reply-username">{reply.username}</span>
                                                                                                            <span class="reply-target">Reply @{replyParent?.username || ''}:</span>
                                                    <span class="reply-message">
                                                        {#await highlightMentions(reply.content)}
                                                            <span>Loading...</span>
                                                        {:then highlightedContent}
                                                            {@html highlightedContent}
                                                        {:catch error}
                                                            <span>{reply.content}</span>
                                                        {/await}
                                                    </span>
                                                </div>
                                                <div class="reply-actions">
                                                    <div class="reply-actions-left">
                                                        <span class="reply-time">{formatDateTime(reply.createdDttm)}</span>
                                                        {#if isUserLoggedIn()}
                                                            <button 
                                                                class="action-button reply-btn" 
                                                                on:click={() => toggleReplyForm(reply.commentId)}
                                                            >
                                                                💬 Reply
                                                            </button>
                                                        {/if}
                                                    </div>
                                                    <!-- Delete button for expanded replies -->
                                                    {#if ((reply.userId == userId) || (articleAuthorId == userId))}
                                                        <button 
                                                            class="action-button delete-btn" 
                                                            on:click={() => deleteComment(reply.commentId)}
                                                            title="Delete Reply"
                                                        >
                                                            🗑️
                                                        </button>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Reply form -->
                                        {#if showReplyForm[reply.commentId]}
                                            <div class="reply-form-inline">
                                                <textarea 
                                                    bind:value={replyContent[reply.commentId]}
                                                                                                            placeholder="Reply @{reply.username}..."  
                                                    rows="2"
                                                />
                                                                                                <div class="reply-form-actions">
                                                    <button class="post-reply-button" on:click={() => submitReply(reply.commentId)}>
                                                        Post
                                                    </button>
                                                    <button class="cancel-reply-button" on:click={() => toggleReplyForm(reply.commentId)}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}
                                    {/if}
                                {/each}
                            {/if}
                            
                            <!-- Expand/collapse replies button -->
                            {#if allReplies.length > 1}
                                <button 
                                    class="expand-replies-button" 
                                    on:click={() => toggleExpandAllReplies(comment.commentId)}
                                >
                                    {#if expandedReplies[comment.commentId]}
                                        Collapse replies
                                    {:else}
                                        Expand all {allReplies.length} replies
                                    {/if}
                                </button>
                            {/if}
                            {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        {:else}
            <!-- Empty state when no comments exist -->
            <div class="no-comments">
                No comments yet. Be the first to comment!
            </div>
        {/each}
    {/if}
</div>

{/if}

<style>
    /* Main container for the entire comment section */
    .comment-section {
        background: var(--light-gray);
        padding: 1.5rem;
        border-radius: var(--radius);
        margin-top: 2rem;
        box-shadow: var(--shadow);
    }
    
    /* Comment section title styling */
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .comment-header h3 {
        margin: 0;
        font-family: var(--heading-2-font-family);
        font-weight: var(--heading-2-font-weight);
        font-size: var(--heading-2-font-size);
        color: var(--new-brand-color);
        line-height: var(--heading-2-line-height);
    }
    
    /* Error message styling  */
    .error-message {
        background: #fee;
        border: 1px solid #fcc;
        border-radius: var(--radius);
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        animation: slideDown 0.3s ease-out;
    }
    
    .error-text {
        color: #c33;
        font-family: var(--body-text-font-family);
        font-size: var(--body-text-font-size);
        font-weight: 500;
        flex: 1;
    }
    
    .error-close {
        background: none;
        border: none;
        color: #c33;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
        line-height: 1;
        transition: color 0.2s ease;
    }
    
    .error-close:hover {
        color: #a11;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Toggle button for showing/hiding entire comment section  */
    .toggle-button {
        background: transparent;
        color: var(--brand-primary-dark);
        border: 1px solid var(--brand-primary);
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: var(--heading-3-font-size);
        font-weight: var(--heading-3-font-weight);
        transition: all 0.3s ease;
    }
    
    .toggle-button:hover {
        background: var(--brand-primary);
        color: var(--brand-primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow);
    }
    
    /* Container for new comment form  */
    .comment-form {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    }
    
    /* Textarea styling for new comment input  */
    .comment-form textarea, .reply-form textarea {
        width: 100%;
        padding: 1rem;
        font-family: var(--body-text-font-family);
        font-size: var(--body-text-font-size);
        line-height: var(--body-text-line-height);
        border-radius: var(--radius);
        border: 1px solid var(--icon);
        margin-bottom: 1rem;
        resize: vertical;
        min-height: 100px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
    }
    
    .comment-form textarea:focus, .reply-form textarea:focus {
        outline: none;
        border-color: var(--brand-primary);
        box-shadow: 0 0 0 3px rgba(164, 232, 224, 0.1);
    }
    
    /* Highlighted mention in comment text  */
    .comment-text :global(.mention),
    .reply-message :global(.mention) {
        color: var(--brand-primary-dark);
        font-weight: 600;
        background: rgba(164, 232, 224, 0.2);
        padding: 0.125rem 0.25rem;
        border-radius: 3px;
        text-decoration: none;
    }
    
    /* Submit button for new comments */
    .post-button {
        background: var(--brand-primary-dark);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius);
        border: none;
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-weight: 600;
        font-size: var(--body-text-font-size);
        transition: all 0.3s ease;
    }
    
    .post-button:hover {
        background: var(--text-secondary);
        transform: translateY(-1px);
        box-shadow: var(--shadow);
    }
    
    /* Login reminder for non-authenticated users  */
    .login-reminder {
        text-align: center;
        padding: 1.5rem;
        background: rgba(164, 232, 224, 0.1);
        border-radius: var(--radius);
        margin-bottom: 2rem;
        font-family: var(--body-text-font-family);
        font-size: var(--body-text-font-size);
        color: var(--primary-text);
    }
    
    .login-reminder a {
        color: var(--brand-primary-dark);
        text-decoration: none;
        font-weight: 600;
        border-bottom: 1px solid var(--brand-primary);
        transition: all 0.3s ease;
    }
    
    .login-reminder a:hover {
        color: var(--text-secondary);
        border-bottom-color: var(--text-secondary);
    }
    
    /* Comment thread container  */
    .comment-thread {
        margin-bottom: 2rem;
    }
    
    /* Individual comment item container  */
    .comment-item {
        background: white;
        padding: 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        margin-bottom: 1rem;
        transition: transform 0.2s ease;
    }
    
    .comment-item:hover {
        transform: translateY(-1px);
    }
    
    /* Reply item styling  */
    .reply-item {
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: 8px;
        padding: 1rem;
        margin: 0.75rem 0 0.75rem 64px; /* indent to show nesting */
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s ease;
        }
    
    .reply-item::before {
        display: none;
    }
        

        .reply-item:hover {
        transform: translateY(-2px);
        }


        .reply-item .comment-item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.reply-item .comment-info {
  flex: 1;
}

.reply-item .reply-indicator {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
  margin-top: 0.25rem;
}

.reply-item .comment-content {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
}

.reply-item .comment-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

        
    /* Header section of each comment with user info and actions  */
    .comment-item-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    /* User avatar image styling  */
    .comment-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 1rem;
        object-fit: cover;
        border: 2px solid var(--brand-primary);
    }
    
    /* Smaller avatar for replies  */
    .reply-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 1rem;
        object-fit: cover;
        border: 2px solid var(--brand-primary);
    }
    
    /* Container for user information */
    .comment-info {
        flex: 1;
    }
    
    /* Username display styling */
    .comment-username {
        font-family: var(--heading-3-font-family);
        font-weight: var(--heading-3-font-weight);
        font-size: var(--heading-3-font-size);
        color: var(--primary-text);
        margin-bottom: 0.25rem;
    }
    
    /* Timestamp display styling */
    .comment-time {
        font-family: var(--body-text-font-family);
        font-size: 14px;
        color: var(--icon);
    }
    
    /* Reply indicator styling  */
    .reply-indicator {
        font-family: var(--body-text-font-family);
        font-size: var( --body-bigger-font-size);
        color: var(--text-secondary);
        font-style: italic;
        margin-top: 0.25rem;
    }
    
    /* Container for action buttons  */
    .comment-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }
    
    /* Collapse/Expand button for replies  */
    .collapse-button {
        background: transparent;
        color: var(--brand-primary-dark);
        border: 1px solid var(--brand-primary);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: 12px;
        font-weight: 600;
        min-width: 2rem;
        transition: all 0.3s ease;
    }
    
    .collapse-button:hover {
        background: var(--brand-primary);
        color: var(--brand-primary-dark);
    }
    
    .reply-collapse-button {
        font-size: 10px;
        padding: 0.2rem 0.4rem;
        min-width: 1.5rem;
    }

    /* Toggle visibility button for individual comments  */
    .toggle-comment-button {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--icon);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: var(--heading-3-font-size);
        transition: all 0.3s ease;
    }
    
    .toggle-comment-button:hover {
        background: var(--brand-primary);
        border-color: var(--brand-primary-dark);
        color: var(--brand-primary-dark);
    }
    
    /* Reply button styling  */
    .reply-button {
        background: transparent;
        color: var(--brand-primary-dark);
        border: 1px solid var(--brand-primary);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .reply-button:hover {
        background: var(--brand-primary);
        color: var(--brand-primary-dark);
    }
    
    /* Delete button styling  */
    .delete-button {
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .delete-button:hover {
        background: #ff5252;
        transform: translateY(-1px);
        box-shadow: var(--shadow);
    }
    
    /* Visible comment text styling  */
    .comment-text {
        color: var(--primary-text);
        font-family: var(--body-text-font-family);
        font-size: var(--body-bigger-font-size);
        line-height: var(--body-text-line-height);
        word-break: break-word;
    }
    
    /* Container for hidden comment placeholder  */
    .comment-content-hidden {
        padding: 1rem 0;
    }
    
    /* Styling for hidden comment placeholder text  */
    .hidden-text {
        color: var(--icon);
        font-family: var(--body-text-font-family);
        font-style: italic;
        text-align: center;
        padding: 1rem;
        background: var(--light-gray);
        border-radius: var(--radius);
        border: 1px dashed var(--icon);
    }
    
    /* Reply form styling  */
    .reply-form {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(164, 232, 224, 0.05);
        border-radius: var(--radius);
        border: 1px solid var(--brand-primary);
    }
    
    .reply-form textarea {
        margin-bottom: 0.75rem;
        min-height: 60px;
    }
    
    /* Reply form actions container  */
    .reply-form-actions {
        display: flex;
        gap: 0.75rem;
    }
    
    /* Post reply button styling */
    .post-reply-button {
        background: var(--brand-primary-dark);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        border: none;
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: var(--body-bigger-font-size);
        transition: all 0.3s ease;
    }
    
    .post-reply-button:hover {
        background: var(--text-secondary);
    }
    
    /* Cancel reply button styling  */
    .cancel-reply-button {
        background: transparent;
        color: var(--icon);
        border: 1px solid var(--icon);
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-family: var(--body-text-font-family);
        font-size: var(--body-bigger-font-size);
        transition: all 0.3s ease;
    }
    
    .cancel-reply-button:hover {
        background: var(--icon);
        color: white;
    }
    
    /* Empty state styling when no comments exist  */
    .no-comments {
        text-align: center;
        color: var(--icon);
        padding: 3rem 1.5rem;
        font-family: var(--body-text-font-family);
        font-size: var(  --body-bigger-font-size);
        font-style: italic;
        background: white;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    }


    .comment-avatar {
        width: 32px !important;
        height: 32px !important;
        margin-right: 8px;
    }

    .reply-avatar {
        width: 24px !important;
        height: 24px !important;
        margin-right: 6px;
    }


    .replies-container {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
    }



    .reply-content {
        flex: 1;
        min-width: 0;
    }

    .reply-text {
        line-height: 1.4;
        margin-bottom: 4px;
    }

    .reply-username {
        font-weight: 500;
        color: #333;
        font-size: var(--body-bigger-font-size);
        margin-right: 4px;
    }

    .reply-target {
        color: #999;
        font-size: var(--body-bigger-font-size);
        margin-right: 4px;
    }

    .reply-message {
        color: #333;
        font-size: var(  --body-bigger-font-size);
        word-break: break-word;
    }

    .reply-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
    }
    
    .reply-actions-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .reply-time {
        font-size: var(--body-small);
        color: #999;
    }


    .reply-form-inline {
        margin: 8px 0 8px 64px;
        padding: 8px 12px;
        background: #f8f8f8;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }

    .reply-form-inline textarea {
        width: 100%;
        min-height: 60px;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px;
        font-size: var(--body-bigger-font-size);
        resize: vertical;
        margin-bottom: 8px;
    }


    .icon-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: var(--heading-3-font-size);
        transition: background-color 0.2s;
    }

    .icon-button:hover {
        background: #f5f5f5;
    }


    .comment-bottom-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        padding-top: 4px;
    }

    .comment-actions-left {
        display: flex;
        gap: 16px;
    }

    .action-button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 12px;
        color: #999;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .action-button:hover {
        background: #f5f5f5;
        color: #666;
    }

    /* Special styling for delete button in replies */
    .delete-btn {
        color: #ff6b6b !important;
    }

    .delete-btn:hover {
        background: #ffe0e0 !important;
        color: #ff5252 !important;
    }




    .collapse-arrow-button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: var(--heading-3-font-size);
        color: #999;
        padding: 4px;
        border-radius: 4px;
        line-height: 1;
        transition: all 0.2s;
    }

    .collapse-arrow-button:hover {
        background: #f5f5f5;
        color: #666;
    }



    .reply-content {
        flex: 1;
        min-width: 0;
    }

    .reply-username {
        font-weight: 500;
        color: #333;
        font-size: var(--heading-3-font-size);
        margin-right: 6px;
    }

    .reply-text {
        color: #666;
        font-size: 13px;
        word-break: break-word;
    }

    .reply-time {
        font-size: var(--body-small);
        color: #999;
        margin-top: 4px;
    }


    .expand-replies-button {
        background: transparent;
        border: none;
        color: #3478f6;
        font-size: 13px;
        cursor: pointer;
        padding: 6px 0;
        margin-left: 64px; 
        margin-top: 4px;
    }

    .expand-replies-button:hover {
        text-decoration: underline;
    }



</style>