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
  md.use(container, 'quiz', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const questionData = tokens[idx].info.trim().split(' ').slice(1).join(' ');
        const correctAnswerIndex = parseInt(questionData.split('|')[0].trim());
        const question = questionData.split('|')[1].trim();
        currentQuestion = {
          correctAnswerIndex,
          question,
          options: [],
        };
        return '';
      } else {
        const { correctAnswerIndex, question, options } = currentQuestion;
        const questionHtml = `<div class="question" data-answer="${correctAnswerIndex}"><h2>${question}</h2><div class="list-group">${options.join('')}</div></div>`;
        currentQuestion = null;
        return questionHtml;
      }
    },
  });

  md.use(container, 'option', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '';
      } else {
        const optionText = tokens[idx - 2].content.trim();
        const optionHtml = `<button type="button" class="list-group-item list-group-item-action">${optionText}</button>`;
        if (currentQuestion) {
          currentQuestion.options.push(optionHtml);
        }
        return '';
      }
    },
  });

  md.renderer.rules.text = function (tokens, idx, options, env, self) {
    if (currentQuestion) {
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
