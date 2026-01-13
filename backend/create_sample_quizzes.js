const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mcq_platform.db');

async function createSampleQuizzes() {
  try {
    console.log('Creating sample quizzes and questions...\n');

    // Create categories first
    const categories = [
      { name: 'JavaScript', description: 'JavaScript Programming' },
      { name: 'React', description: 'React.js Framework' },
      { name: 'General Knowledge', description: 'General Knowledge Questions' },
      { name: 'Python', description: 'Python Programming' }
    ];

    const categoryIds = [];

    for (const cat of categories) {
      db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [cat.name, cat.description],
        function(err) {
          if (err) {
            console.log(`Category ${cat.name} insert error:`, err.message);
          } else {
            console.log(`Category created: ${cat.name} (ID: ${this.lastID})`);
            categoryIds.push({ name: cat.name, id: this.lastID });
          }
        }
      );
    }

    // Wait for categories to be created
    setTimeout(() => {
      // Sample quizzes data
      const quizzes = [
        {
          title: 'JavaScript Basics',
          description: 'Test your knowledge of JavaScript fundamentals',
          category: 'JavaScript',
          time_limit: 30,
          questions: [
            {
              text: 'What is the difference between "let" and "var" in JavaScript?',
              options: JSON.stringify([
                'let is block-scoped, var is function-scoped',
                'var is block-scoped, let is function-scoped',
                'There is no difference',
                'let is faster than var'
              ]),
              correct: 'let is block-scoped, var is function-scoped',
              explanation: 'let is block-scoped (ES6), while var is function-scoped (pre-ES6)'
            },
            {
              text: 'Which method is used to combine two or more arrays?',
              options: JSON.stringify([
                'concat()',
                'merge()',
                'combine()',
                'join()'
              ]),
              correct: 'concat()',
              explanation: 'concat() is the JavaScript method to combine arrays'
            },
            {
              text: 'What is a closure in JavaScript?',
              options: JSON.stringify([
                'A function that is closed and cannot be opened',
                'A function that has access to another function\'s scope',
                'The end of a program',
                'A type of loop'
              ]),
              correct: 'A function that has access to another function\'s scope',
              explanation: 'A closure is a function that has access to variables from its outer scope'
            }
          ]
        },
        {
          title: 'React Fundamentals',
          description: 'Test your knowledge of React.js basics',
          category: 'React',
          time_limit: 25,
          questions: [
            {
              text: 'What is JSX?',
              options: JSON.stringify([
                'JavaScript XML syntax extension',
                'Java Syntax Extension',
                'JSON Extra',
                'Just X elements'
              ]),
              correct: 'JavaScript XML syntax extension',
              explanation: 'JSX is a syntax extension for JavaScript that looks similar to XML/HTML'
            },
            {
              text: 'What is the virtual DOM in React?',
              options: JSON.stringify([
                'A copy of the real DOM kept in memory',
                'The actual DOM in the browser',
                'A database',
                'A backup of the DOM'
              ]),
              correct: 'A copy of the real DOM kept in memory',
              explanation: 'The virtual DOM is an in-memory representation of the real DOM'
            }
          ]
        },
        {
          title: 'General Knowledge Quiz',
          description: 'A mixed bag of general knowledge questions',
          category: 'General Knowledge',
          time_limit: 20,
          questions: [
            {
              text: 'What is the capital of France?',
              options: JSON.stringify([
                'Paris',
                'Lyon',
                'Marseille',
                'Nice'
              ]),
              correct: 'Paris',
              explanation: 'Paris is the capital and largest city of France'
            },
            {
              text: 'Which planet is the largest in our solar system?',
              options: JSON.stringify([
                'Saturn',
                'Jupiter',
                'Neptune',
                'Earth'
              ]),
              correct: 'Jupiter',
              explanation: 'Jupiter is the largest planet in our solar system'
            }
          ]
        },
        {
          title: 'Python Programming',
          description: 'Test your Python programming skills',
          category: 'Python',
          time_limit: 30,
          questions: [
            {
              text: 'What is the correct way to define a function in Python?',
              options: JSON.stringify([
                'function myFunc(): pass',
                'def myFunc(): pass',
                'func myFunc(): pass',
                'define myFunc(): pass'
              ]),
              correct: 'def myFunc(): pass',
              explanation: 'Python uses the "def" keyword to define functions'
            },
            {
              text: 'What does len() function return?',
              options: JSON.stringify([
                'Length of a string',
                'Length of a list/array',
                'Length of any sequence object',
                'Longest item in a collection'
              ]),
              correct: 'Length of any sequence object',
              explanation: 'len() returns the length of any sequence object (string, list, tuple, etc.)'
            }
          ]
        }
      ];

      // Get admin user ID
      db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', (err, admin) => {
        if (err || !admin) {
          console.log('Error: No admin user found. Please create users first.');
          db.close();
          return;
        }

        const adminId = admin.id;
        let quizzesCreated = 0;

        quizzes.forEach((quiz) => {
          // Get category ID
          db.get('SELECT id FROM categories WHERE name = ?', [quiz.category], (err, cat) => {
            if (err || !cat) {
              console.log(`Category ${quiz.category} not found`);
              return;
            }

            // Create quiz
            db.run(
              'INSERT INTO quizzes (title, description, category_id, created_by, status, time_limit, total_questions) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [quiz.title, quiz.description, cat.id, adminId, 'published', quiz.time_limit, quiz.questions.length],
              function(err) {
                if (err) {
                  console.log(`Quiz ${quiz.title} insert error:`, err.message);
                  return;
                }

                const quizId = this.lastID;
                console.log(`Quiz created: ${quiz.title} (ID: ${quizId})`);

                // Add questions to the quiz
                quiz.questions.forEach((q, index) => {
                  db.run(
                    'INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation, points) VALUES (?, ?, ?, ?, ?, ?)',
                    [quizId, q.text, q.options, q.correct, q.explanation, 1],
                    function(err) {
                      if (err) {
                        console.log(`  Question ${index + 1} insert error:`, err.message);
                      } else {
                        console.log(`  Question ${index + 1} added`);
                      }
                    }
                  );
                });

                quizzesCreated++;
              }
            );
          });
        });

        // Show summary after a delay
        setTimeout(() => {
          db.all('SELECT id, title, status, category_id FROM quizzes ORDER BY id', (err, quizzes) => {
            console.log('\n--- Quizzes in database ---');
            if (quizzes.length > 0) {
              quizzes.forEach(q => {
                console.log(`ID: ${q.id}, Title: ${q.title}, Status: ${q.status}, Category ID: ${q.category_id}`);
              });
            } else {
              console.log('No quizzes found');
            }
            db.close();
          });
        }, 1000);
      });
    }, 500);

  } catch (err) {
    console.error('Error:', err);
    db.close();
  }
}

createSampleQuizzes();
