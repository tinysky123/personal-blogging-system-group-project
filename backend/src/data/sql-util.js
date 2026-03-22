


/**
 * Builds and executes an SQL UPDATE statement with the given data.
 * 
 * For example, if the tableName = "Customers", and updateData.firstName = "John", updateData.lastName = "Doe",
 * id = 3, and idColumn = "id", then the following statement will be run:
 * 
 * UPDATE Customers SET firstName = 'John', lastName = 'Doe' WHERE id = 3
 * 
 * You are welcome to use this function in your own code.
 * 
 * @author Andrew Meads
 * 
 * @param {any} db the database
 * @param {string} tableName the name of the table to update
 * @param {any} updateData the object containing the update data
 * @param {any} id the primary key
 * @param {string} idColumn the name of the primary key column. Defaults to "id".
 * @returns 
 */
export async function updateDatabase(db, tableName, updateData, id, idColumn = "id") {
    const updateOperations = [];
    const updateParams = [];

    // Build update statement based on props in supplied updateData object.
    for (const prop in updateData) {
        const value = updateData[prop];
        updateOperations.push(`${prop} = ?`);
        updateParams.push(value);
    }

    // Build actual SQL statement
    const sql = `UPDATE ${tableName} SET ${updateOperations.join(", ")} WHERE ${idColumn} = ?`;
    console.log(sql);

    // Execute update and return result
    const dbResult = await db.run(sql, ...updateParams, parseInt(id));
    return dbResult;
}

/**
 * Builds and executes an SQL DELETE statement to delete data from a table based on multiple field conditions.
 *
 * @author [yangdongqing]
 * 
 * @param {any} db the database
 * @param {string} tableName the name of the table to delete data from
 * @param {Array<{ field: string, value: any, operator: '=' | 'LIKE' }>} conditions Search the array of conditions
 * @returns 
 */
export async function deleteByFieldValue(db, tableName, conditions) {
    const whereClauses = [];
    const values = [];

    conditions.forEach((condition) => {
        if (condition.operator === 'LIKE') {
            whereClauses.push(`${condition.field} LIKE ?`);
            values.push(`%${condition.value}%`);
        } else {
            whereClauses.push(`${condition.field} = ?`);
            values.push(condition.value);
        }
    });

    let sql = `DELETE FROM ${tableName}`;
    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    console.log(sql);

    const dbResult = await db.run(sql, ...values);
    return dbResult;
}

/**
 * Batch modify a certain field of the data corresponding to an array in a table based on the array of a certain field.
 * 
 * @author [yangdongqing]
 * 
 * @param {any} db Database instance
 * @param {string} tableName The table name of the data to be updated
 * @param {string} fieldName The field name used for filtering records
 * @param {any[]} fieldValues An array of field values used for filtering records
 * @param {string} updateField The field name to be updated
 * @param {any} updateValue The field value to be updated
 * @returns {Promise<any[]>} An array containing the result of each update operation
 */
export async function batchUpdateByFieldArray(db, tableName, fieldName, fieldValues, updateField, updateValue) {
    const results = [];

    for (const value of fieldValues) {
        const sql = `UPDATE ${tableName} SET ${updateField} = ? WHERE ${fieldName} = ?`;
        console.log(sql);
        const dbResult = await db.run(sql, updateValue, value);
        results.push(dbResult);
    }

    return results;
}

/**
 * Insert data into the specified table based on the incoming JSON data.
 * @author [yangdongqing]
 * @param {any} db Database instance
 * @param {string} tableName The table name of the data to be updated
 * @param {object} insertData The JSON object containing the data to be inserted
 * @returns {Promise<any>} The result of the insertion operation
 */
export async function insertDataFromJson(db, tableName, insertData) {
    const columns = [];
    const values = [];
    const placeholders = [];

    for (const key in insertData) {
        columns.push(key);
        values.push(insertData[key]);
        placeholders.push('?');
    }

    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log(sql);

    const dbResult = await db.run(sql, ...values);
    return dbResult;
}

/**
 * Search for several fields in a certain table (supporting LIKE or = operations) and sort them by these fields.
 * 
 * @author [yangdongqing]
 * @param {any} db atabase instance
 * @param {string} tableName The table name of the data to be updated
 * @param {Array<{ field: string, value: any, operator: '=' | 'LIKE' }>} conditions Search the array of conditions
 * @param {Array<{ field: string, order: 'ASC' | 'DESC' }>} sortFields Array of sorting fields
 * @param {number} page The current page number starts from 1
 * @param {number} count The number of records displayed on each page
 * @returns {Promise<any[]>} Search result array
 */
export async function searchTable(db, tableName, conditions, sortFields, page, count) {
    let query = `SELECT * FROM ${tableName}`;
    if (conditions && Object.keys(conditions).length > 0) {
        const whereClauses = Object.entries(conditions).map(([key, value]) => `${key} = ?`).join(' AND ');
        query += ` WHERE ${whereClauses}`;
    }
    if (sortFields && sortFields.length > 0) {
        const sortClauses = sortFields.map(({ field, order }) => `${field} ${order}`).join(', ');
        query += ` ORDER BY ${sortClauses}`;
    }
    if (page > 0 && count > 0) {
        const offset = (page - 1) * count;
        query += ` LIMIT ${count} OFFSET ${offset}`;
    }
    const results = await db.all(query, Object.values(conditions || {}));
    return results;
}

/**
 * Execute the SQL statement with parameters.
 * 
 * @author [yangdongqing]
 * @param {any} db atabase instance
 * @param {string} sql SQL statement
 * @param {...any} params SQL params
 * @returns {Promise<any>} result
 */
export async function executeParameterizedSql(db, sql,type, ...params) {
    console.log(sql);
    let dbResult;
    if(type==="all"){
        dbResult = await db.all(sql, ...params);
    }
    if(type==="get"){
        dbResult = await db.get(sql, ...params);
    }
    if(type==="run"){
        dbResult = await db.run(sql, ...params);
    }
    return dbResult;
}



export async function searchTable2(db, tableName, conditions = [], sortFields = [], page, count) {
    let query = `SELECT * FROM ${tableName}`;
    const whereClauses = [];
    const values = [];

    for (const condition of conditions) {
        whereClauses.push(`${condition.field} ${condition.operator} ?`);
        values.push(condition.operator === 'LIKE' ? `%${condition.value}%` : condition.value);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (sortFields && sortFields.length > 0) {
        const sortClauses = sortFields.map(({ field, order }) => `${field} ${order}`).join(', ');
        query += ` ORDER BY ${sortClauses}`;
    }

    if (page > 0 && count > 0) {
        const offset = (page - 1) * count;
        query += ` LIMIT ${count} OFFSET ${offset}`;
    }

    return await db.all(query, values);
}
