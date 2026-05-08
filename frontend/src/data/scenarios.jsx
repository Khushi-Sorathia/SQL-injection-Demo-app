export const scenarios = [
  {
    id: 'a',
    title: 'Scenario A: Authentication Bypass',
    method: 'POST',
    description: 'Learn how attackers bypass login screens using classic SQL Injection techniques.',
    explanation: (
      <>
        <p>This scenario demonstrates <b>In-Band SQL Injection</b>.</p>
        <p>The vulnerable code directly concatenates user input into the SQL string. By inputting <code>' OR '1'='1</code>, the attacker changes the logic of the WHERE clause.</p>
        <p>The condition <code>'1'='1'</code> is always true, so the database returns the first user it finds (often the admin), bypassing password checks entirely.</p>
        <p>The secure version uses <b>Parameterized Queries (Prepared Statements)</b>. The database driver sends the query structure and the user data separately. The database treats the input strictly as a literal string, not executable code.</p>
      </>
    ),
    defaultInputs: {
      username: "' OR '1'='1",
      password: "anything"
    },
    inputConfig: [
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
      { name: 'password', label: 'Password', type: 'text', placeholder: 'Enter password' }
    ],
    suggestedPayloads: [
      { payload: "' OR '1'='1", desc: "Classic auth bypass. Makes the WHERE clause always true." },
      { payload: "admin' --", desc: "Logs in as admin and comments out the password check." }
    ],
    vulnCode: `app.post('/api/scenario/a/vulnerable', async (req, res) => {
  const { username, password } = req.body;

  // DANGER: String concatenation allows SQL structure to be altered
  const rawQuery = \`SELECT * FROM users
    WHERE username = '\${username}'
    AND password = '\${password}'\`;

  const result = await pool.query(rawQuery);
  res.json(result);
});`,
    secCode: `app.post('/api/scenario/a/secure', async (req, res) => {
  const { username, password } = req.body;

  // SAFE: Parameterized query
  const query = \`SELECT * FROM users
    WHERE username = $1
    AND password = $2\`;

  // The driver handles escaping and separating data from code
  const result = await pool.query(query, [username, password]);
  res.json(result);
});`
  },
  {
    id: 'b',
    title: 'Scenario B: Data Exfiltration (UNION)',
    method: 'GET',
    description: 'See how search fields can be abused to extract sensitive data from other tables.',
    explanation: (
      <>
        <p>This scenario demonstrates <b>UNION-based SQL Injection</b>.</p>
        <p>If a search query concatenates input, an attacker can append a <code>UNION SELECT</code> statement. This combines the results of the original search with results from a completely different table.</p>
        <p><b>Note:</b> For UNION to work, the injected SELECT statement must return the same number of columns as the original SELECT statement.</p>
        <p>The secure code prevents this because the parameterization ensures the entire payload is treated simply as the search string for the ILIKE operator.</p>
      </>
    ),
    defaultInputs: {
      q: "' UNION SELECT id, document_name, content, 1 FROM secret_data -- "
    },
    inputConfig: [
      { name: 'q', label: 'Search Products', type: 'text', placeholder: 'Search term...' }
    ],
    suggestedPayloads: [
      { payload: "Laptop", desc: "Normal search behavior." },
      { payload: "' UNION SELECT id, username, password, 1 FROM users -- ", desc: "Exfiltrates user credentials." },
      { payload: "' UNION SELECT id, document_name, content, 1 FROM secret_data -- ", desc: "Exfiltrates confidential company data." }
    ],
    vulnCode: `app.get('/api/scenario/b/vulnerable', async (req, res) => {
  const searchTerm = req.query.q || '';

  // DANGER: Input placed directly into query string
  const rawQuery = \`SELECT id, name, description, price
    FROM products
    WHERE name ILIKE '%\${searchTerm}%'\`;

  const result = await pool.query(rawQuery);
  res.json(result);
});`,
    secCode: `app.get('/api/scenario/b/secure', async (req, res) => {
  const searchTerm = req.query.q || '';

  // SAFE: Parameterized query for LIKE/ILIKE clauses
  const query = \`SELECT id, name, description, price
    FROM products
    WHERE name ILIKE $1\`;

  // The wildcard % must be part of the parameter, not the query
  const params = [\`%\${searchTerm}%\`];

  const result = await pool.query(query, params);
  res.json(result);
});`
  },
  {
    id: 'c',
    title: 'Scenario C: Error-based / Blind',
    method: 'GET',
    description: 'Learn how numeric inputs without validation can lead to injection.',
    explanation: (
      <>
        <p>This scenario shows injection via an unquoted integer field.</p>
        <p>Even though the <code>id</code> is expected to be a number, the vulnerable code accepts any string. Since it's not wrapped in quotes in the SQL, an attacker doesn't even need to use quotes to break out.</p>
        <p>They can use math operations (<code>1/0</code>) to force errors, or stack queries using semicolons (<code>1; DROP TABLE...</code>) depending on the driver configuration.</p>
        <p>The secure version does two things: strict input validation (ensuring it's actually a number) and parameterized queries.</p>
      </>
    ),
    defaultInputs: {
      id: "1 OR 1=1"
    },
    inputConfig: [
      { name: 'id', label: 'User ID', type: 'text', placeholder: 'Enter user ID' }
    ],
    suggestedPayloads: [
      { payload: "1", desc: "Normal numeric lookup." },
      { payload: "1 OR 1=1", desc: "Returns all users by altering the math logic." },
      { payload: "1; SELECT 1/0", desc: "Attempts to force a divide-by-zero error." }
    ],
    vulnCode: `app.get('/api/scenario/c/vulnerable', async (req, res) => {
    const id = req.query.id || '1';

    // DANGER: Unvalidated input used directly as integer
    const rawQuery = \`SELECT id, username, role
      FROM users WHERE id = \${id}\`;

    const result = await pool.query(rawQuery);
    res.json(result);
});`,
    secCode: `app.get('/api/scenario/c/secure', async (req, res) => {
    const id = req.query.id || '1';

    // SAFE Step 1: Input Validation
    if (isNaN(parseInt(id))) {
      return res.json({ error: 'Invalid input' });
    }

    // SAFE Step 2: Parameterization
    const query = \`SELECT id, username, role
      FROM users WHERE id = $1\`;

    const result = await pool.query(query, [id]);
    res.json(result);
});`
  }
];
