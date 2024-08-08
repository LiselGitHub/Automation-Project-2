// Variables and functions

const trashButton = '[data-testid="icon:trash"]';
const confirmWindow = '[data-testid="modal:confirm"]';
const deleteText = 'Are you sure you want to delete this issue?';
const deleteMessage = "Once you delete, it's gone for good";
const backlog = '[data-testid="board-list:backlog"]';
const backlogList = '[data-testid="list-issue"]';
const closeIssueButton = '[data-testid="icon:close"]';
const issueModal = '[data-testid="modal:issue-details"]';

let deletedIssueTitle = 'This is an issue of type: Task.';
let issueTitle = 'This is an issue of type: Task.';

function clickOnTrashButtonAndAssert() {
  cy.get(trashButton).should('be.visible').click();
}

function deleteIssue() {
  cy.get('button').contains('Delete issue').should('be.visible').click();
}

function assertConfirmationWindowData(text, message) {
  cy.get(confirmWindow).should('be.visible');
  cy.get(confirmWindow)
    .should('contain', text)
    .and('contain', message)
    .and('contain', 'Delete issue')
    .and('contain', 'Cancel');
}

function assertBacklogAfterDel(expectedAmountIssues, title) {
  cy.wait(60000);
  cy.reload();

  cy.get(confirmWindow).should('not.exist');
  cy.get(issueModal).should('not.exist');

  cy.get('div').should('contain', 'Kanban board');

  cy.get(backlog)
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      cy.get(backlogList).should('have.length', expectedAmountIssues);
    });
  cy.get(backlogList).contains(title).should('not.exist');
}

function cancelDeletionAndAssert(title) {
  cy.get(confirmWindow)
    .should('be.visible')
    .within(() => {
      cy.get('button').contains('Cancel').should('be.visible').click();
    });

  cy.wait(60000);

  cy.get(issueModal).should('be.visible').and('contain', title);
}

function assertBacklogAfterCancelDeletion(expectedAmountIssues, title) {
  cy.get('div').should('contain', 'Kanban board');

  cy.get(backlog)
    .should('be.visible')
    .and('have.length', 1)
    .within(() => {
      cy.get(backlogList)
        .should('have.length', expectedAmountIssues)
        .contains(title);
    });
}

// Test cases

describe('Deleting existing issue', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains('This is an issue of type: Task.').click();
      });
  });

  it('Should delete existing issue Task-2504424 and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    deleteIssue();
    assertBacklogAfterDel(3, deletedIssueTitle);
  });

  it('Should cancel deletion process, leave issue visible and validate it successfully', () => {
    clickOnTrashButtonAndAssert();
    assertConfirmationWindowData(deleteText, deleteMessage);
    cancelDeletionAndAssert(issueTitle);
    cy.get(closeIssueButton).first().should('be.visible').click();
    assertBacklogAfterCancelDeletion(4, issueTitle);
  });
});
