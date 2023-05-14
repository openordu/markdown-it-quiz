const container = require('markdown-it-container');

let scriptInjected = false; // Add this line to track if the script has been injected

function injectScript() {
  return '<script src="/js/quiz.js"></script>';
}

module.exports = function quizPlugin(md) {
  let currentQuestion = null;
  if (!scriptInjected) {
    md.core.ruler.push('inject_script', function(state) {
      state.tokens.push({
        type: 'html_block',
        content: injectScript(),
        block: true,
        level: 0
      });
    });
    scriptInjected = true;
  }
  md.use(container, 'question', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const questionData = tokens[idx].info.trim().split(' ').slice(1).join(' ');
        const correctAnswers = questionData.split('|')[0].trim().split(',').map(Number);
        const question = questionData.split('|')[1].trim();
        currentQuestion = {
          correctAnswers,
          question,
          options: [],
          questionType: 'multiple-choice', // set default question type
        };
        // Check if the question starts with "Fill in the blank:"
        if (question.startsWith('Fill in the blank:')) {
          currentQuestion.questionType = 'fill-in-the-blank';
        }
        return '';
      } else {
        const { correctAnswers, question, options, questionType } = currentQuestion;
        if (questionType === 'fill-in-the-blank') {
          let questionHtml = `
          <div class="question" data-answers="${correctAnswers.join(',')}">
            <h2>${question}</h2>
            <div class="word-bank btn-group" role="group">
              ${options.map(option => `${option}`).join('')}
            </div>
          </div>`;
        questionHtml = questionHtml.replace(/_{2,}/g, '<input type="text" class="blank form-control-inline" style="width: 100px;" data-answers="' + correctAnswers.join(',') + '" readonly>');
        null;
          return questionHtml;
        } else {
          const questionHtml = `<div class="question" data-answers="${correctAnswers.join(',')}"><h2>${question}</h2><div class="list-group">${options.join('')}</div></div>`;
          currentQuestion = null;
          return questionHtml;
        }
      }
    },
  });
  
  md.use(container, 'option', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '';
      } else {
        const optionText = tokens[idx - 2].content.trim();
        const optionHtml = `<button type="button" class="btn btn-outline-primary list-group-item list-group-item-action constructed-inside-option">${optionText}</button>`;
        if (currentQuestion) {
          currentQuestion.options.push(optionHtml);
        }
        return '';
      }
    },
  });
  
  
  
  md.renderer.rules.text = function (tokens, idx, options, env, self) {
    if (currentQuestion && tokens[idx].level !== 2) {
      return '';
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
    if (currentQuestion) {
      return '';
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.paragraph_close = function (tokens, idx, options, env, self) {
    if (currentQuestion) {
      return '';
    }
    return self.renderToken(tokens, idx, options);
  };
};
