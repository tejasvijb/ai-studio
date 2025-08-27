/// <reference types="cypress" />

describe('AI Studio Image Edit Flow', () => {
  beforeEach(() => {
    // Visit the page before each test
    cy.visit('/');

    // We'll mock the API response to avoid actual API calls
    cy.intercept('POST', '/api/image-edit', {
      statusCode: 200,
      body: {
        success: true,
        image: {
          b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' // Simple 1x1 pixel base64 encoded image
        },
        style: 'editorial',
        prompt: 'Test prompt in editorial style',
        createdAt: Date.now()
      },
      delay: 1000 // Add a delay to simulate processing time
    }).as('imageEditRequest');
  });

  it('should upload an image via file input', () => {
    // Test file upload through the file input
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });

    // Verify preview is displayed
    cy.get('img[alt="Preview"]').should('be.visible');
  });

  it('should upload an image via drag and drop', () => {
    // Test drag and drop functionality
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      // Create a DataTransfer object and attach the file
      cy.get('[class*="border-dashed"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      }, { subjectType: 'drag-n-drop' });
    });

    // Verify preview is displayed
    cy.get('img[alt="Preview"]').should('be.visible');
  });

  it('should enter prompt and select style', () => {
    // Upload an image first
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });

    // Enter a prompt
    cy.get('#prompt')
      .type('Change the background to a beach scene')
      .should('have.value', 'Change the background to a beach scene');

    // Select a style
    cy.get('button[role="combobox"]').click();
    cy.get('div[role="option"]').contains('Vintage').click();

    // Verify style is selected
    cy.get('button[role="combobox"]').should('contain', 'Vintage');

    // Verify summary is updated
    cy.get('.bg-gray-50 p').should('contain', 'Change the background to a beach scene in vintage style');
  });

  it('should process image and show result', () => {
    // Upload an image
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });

    // Enter a prompt
    cy.get('#prompt').type('Add a mountain background');

    // Click enhance button
    cy.contains('button', 'Enhance Image with AI').click();

    // Verify loading state is shown
    cy.contains('Processing...').should('be.visible');

    // Wait for API response
    cy.wait('@imageEditRequest');

    // Verify result image is displayed
    cy.get('img[alt="AI Enhanced Result"]').should('be.visible');

    // Verify details are displayed
    cy.contains('Style: editorial').should('be.visible');
    cy.contains('Prompt: Test prompt in editorial style').should('be.visible');
    cy.contains('Created At:').should('be.visible');

    // Verify download button is available
    cy.contains('a', 'Download Result').should('be.visible');
  });

  it('should save and display history', () => {
    // First image enhancement
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });
    cy.get('#prompt').type('First generation');
    cy.contains('button', 'Enhance Image with AI').click();
    cy.wait('@imageEditRequest');

    // Reset the form
    cy.contains('button', 'Reset').click();

    // Second image enhancement
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });
    cy.get('#prompt').type('Second generation');
    cy.contains('button', 'Enhance Image with AI').click();
    cy.wait('@imageEditRequest');

    // Verify history section is displayed
    cy.contains('Previous Generations').should('be.visible');

    // Verify we can click on history items
    cy.get('#history-container .history-item').first().click();

    // Verify result is updated to the history item
    cy.contains('Prompt: Test prompt in editorial style').should('be.visible');
  });

  it('should show image in modal on click', () => {
    // Upload and process an image
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });
    cy.get('#prompt').type('Test for modal');
    cy.contains('button', 'Enhance Image with AI').click();
    cy.wait('@imageEditRequest');

    // Click on result image to open modal
    cy.get('img[alt="AI Enhanced Result"]').parent().find('div[class*="absolute inset-0"]').click();

    // Verify modal is open
    cy.get('div[role="dialog"]').should('be.visible');
    cy.get('div[role="dialog"] img').should('be.visible');

    // Close modal
    cy.get('button[aria-label="close"]').click();
    cy.get('div[role="dialog"]').should('not.exist');
  });

  it('should handle errors', () => {
    // Override the intercept to return an error
    cy.intercept('POST', '/api/image-edit', {
      statusCode: 500,
      body: {
        error: 'Failed to process image'
      }
    }).as('imageEditError');

    // Upload an image
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });

    // Enter prompt and submit
    cy.get('#prompt').type('This will fail');
    cy.contains('button', 'Enhance Image with AI').click();
    cy.wait('@imageEditError');

    // Verify error message is displayed
    cy.get('div[class*="bg-red-50"]').should('be.visible');
    cy.contains('Failed to process image').should('be.visible');
  });

  it('should validate form inputs', () => {
    // Try to submit without an image
    cy.get('#prompt').type('No image uploaded');

    // Verify enhancement button is disabled
    cy.contains('button', 'Enhance Image with AI').should('be.disabled');

    // Upload image but leave prompt empty
    cy.fixture('sample-image.jpg', 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'sample-image.jpg',
        mimeType: 'image/jpeg'
      });
    });
    cy.get('#prompt').clear();
    cy.contains('button', 'Enhance Image with AI').click();

    // Verify error message is displayed
    cy.contains('Please enter a prompt').should('be.visible');
  });
});
