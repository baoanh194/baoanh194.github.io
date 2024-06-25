const { getReadinessMessage } = require('../../source/rabbitmq-analysis');

describe('getReadinessMessage function', () => {
    it('should return readiness message when all analysis results are Pass', () => {
        expect.assertions(2);
        const analysisResults = [
            { criteria: 'Criteria 1', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 2', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 3', status: 'Pass', message: 'All good' }
        ];

        const result = getReadinessMessage(analysisResults);

        expect(result.isReady).toBe(true);
        expect(result.message).toBe('Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!');
    });

    it('should return not readiness message when any analysis result is not Pass', () => {
        expect.assertions(2);
        const analysisResults = [
            { criteria: 'Criteria 1', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 2', status: 'Fail', message: 'Something is wrong' },
            { criteria: 'Criteria 3', status: 'Pass', message: 'All good' }
        ];

        const result = getReadinessMessage(analysisResults);

        expect(result.isReady).toBe(false);
        expect(result.message).toBe('Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.');
    });
});