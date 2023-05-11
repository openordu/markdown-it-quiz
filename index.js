const container = require('markdown-it-container');

module.exports = function quizPlugin(md) {
  md.use(container, 'quiz', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const questionData = tokens[idx].info.trim().split(' ').slice(1).join(' ');
        const correctAnswerIndex = parseInt(questionData.split('|')[0].trim());
        const question = questionData.split('|')[1].trim();
        return `<div class="question" data-answer="${correctAnswerIndex}"><h2>${question}</h2><div class="list-group">`;
      } else {
        return '</div></div>';
      }
    },
  });

  md.use(container, 'option', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '';
      } else {
        const optionText = tokens[idx - 1].content.trim();
        return `<button type="button" class="list-group-item list-group-item-action">${optionText}</button>`;
      }
    },
  });
};