const { displayAnalysis } = require('../../source/rabbitmq-analysis');

describe('displayAnalysis function', () => {
    let mockResultDiv;
    let mockAnalysisResults;

    beforeEach(() => {
        mockResultDiv = document.createElement('div');
        mockAnalysisResults = [
            { criteria: 'Erlang Version', status: 'Pass', message: 'Erlang version 26.0 is compatible.' },
            { criteria: 'Number of Nodes', status: 'Pass', message: 'The cluster has a sufficient number of nodes: 5.' },
            { criteria: 'Deprecated Features', status: 'Pass', message: 'No mirroring policies and mirroring queues have found.' }
        ];
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should display analysis results with correct HTML structure', () => {
        // 1 initial check for the table structure + 3 criteria + 3 message + 3 status = 10
        expect.assertions(10);
        displayAnalysis(mockAnalysisResults, mockResultDiv);

        expect(mockResultDiv.innerHTML).toContain('<table><tbody><tr><th>Criteria</th><th>Reason</th><th>Status</th></tr>');
        mockAnalysisResults.forEach(result => {
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.criteria}</td>`);
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.message}</td>`);
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.status}</td>`);
        });
    });

    test('should display readiness message when ready', () => {
        expect.assertions(1)
        const mockReadyMessage = { isReady: true, message: 'Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!' };
        jest.spyOn(require('../../source/rabbitmq-analysis'), 'getReadinessMessage').mockReturnValue(mockReadyMessage);

        displayAnalysis(mockAnalysisResults, mockResultDiv);

        expect(mockResultDiv.innerHTML).toContain('<div class="ready">Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!</div>');
    });

    test('should display readiness message when not ready', () => {
        expect.assertions(10)
        const mockNotReadyMessage = { isReady: false, message: 'Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.' };
        const mockAnalysisResultsNotReady = [
            { criteria: 'Erlang Version', status: 'Fail', message: 'Erlang version 23.3 is not supported.' },
            { criteria: 'Number of Nodes', status: 'Fail', message: 'Even numbers of cluster nodes are not recommended.' },
            { criteria: 'Deprecated Features', status: 'Fail', message: 'Classic queue mirroring will be removed in 4.0.' }
        ];
        jest.spyOn(require('../../source/rabbitmq-analysis'), 'getReadinessMessage').mockReturnValue(mockNotReadyMessage);

        displayAnalysis(mockAnalysisResultsNotReady, mockResultDiv);

        expect(mockResultDiv.innerHTML).toContain('<div class="not-ready">Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.</div>');
        mockAnalysisResultsNotReady.forEach(result => {
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.criteria}</td>`);
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.message}</td>`);
            expect(mockResultDiv.innerHTML).toContain(`<td>${result.status}</td>`);
        });
    });
});