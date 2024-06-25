const { analyze } = require('../../source/rabbitmq-analysis');

describe('analyze', () => {
    test('should detect readiness with valid inputs and no issue', () => {
        expect.assertions(4);
        const definition = {
            rabbit_version: '3.13.0',
            queues: [
                { durable: true, auto_delete: false, arguments: { 'x-queue-type': 'quorum' } }
            ],
            policies: []
        };
        const selectedErlangVersion = '26.0';
        const nodes = 3;

        const result = analyze(definition, selectedErlangVersion, nodes);

        // Explaination about array index:
        // result[0]: RabbitMQ Version Check
        // result[1]: Erlang/OTP Version Check
        // result[2]: Number of Nodes Check
        // result[3]: Deprecated Features
        // Example of Result array:
        // [
        //     {
        //         criteria: 'RMQ version',
        //         status: 'Pass',
        //         message: 'RabbitMQ version 3.13.0 is compatible.'
        //     },
        //     {
        //         criteria: 'Erlang Version',
        //         status: 'Pass',
        //         message: 'Erlang version 26.0 is compatible.'
        //     },
        //     {
        //         criteria: 'Number of Nodes',
        //         status: 'Pass',
        //         message: 'The cluster has a sufficient number of nodes: 3.'
        //     },
        //     {
        //         criteria: 'Deprecated Features',
        //         status: 'Pass',
        //         message: 'No transient queues found.'
        //     }
        // ]

        expect(result).toHaveLength(4);
        expect(result[0].status).toBe('Pass');
        expect(result[1].status).toBe('Pass');
        expect(result[2].status).toBe('Pass');
    });

    test('should detect non-readiness with old RabbitMQ version', () => {
        expect.assertions(4);
        const definition = {
            rabbit_version: '3.12.0',
            queues: [],
            policies: []
        };
        const selectedErlangVersion = '26.0';
        const nodes = 3;

        const result = analyze(definition, selectedErlangVersion, nodes);

        expect(result).toHaveLength(4);
        expect(result[0].status).toBe('Fail');
        expect(result[0].message).toContain('Please consider upgrading RabbitMQ to the 3.13.x version.');
        expect(result[1].status).toBe('Pass'); // Erlang version check
    });

    test('should detect non-readiness with old Erlang/OTP version', () => {
        expect.assertions(4);
        const definition = {
            rabbit_version: '3.13.0',
            queues: [],
            policies: []
        };
        const selectedErlangVersion = '24.0';
        const nodes = 3;

        const result = analyze(definition, selectedErlangVersion, nodes);

        expect(result).toHaveLength(4);
        expect(result[1].status).toBe('Fail');
        expect(result[1].message).toContain('Erlang version 24.0 is not supported for RabbitMQ 4.0. Minimum required version is 26.0.');
        expect(result[0].status).toBe('Pass');
    });

    test('should detect non-readiness with even number of nodes', () => {
        expect.assertions(4);
        const definition = {
            rabbit_version: '3.13.0',
            queues: [],
            policies: []
        };
        const selectedErlangVersion = '26.0';
        const nodes = 4;

        const result = analyze(definition, selectedErlangVersion, nodes);

        expect(result).toHaveLength(4);
        expect(result[2].status).toBe('Fail');
        expect(result[2].message).toContain('Even numbers of cluster nodes are not recommended. Odd numbers of cluster nodes are highly recommended. Odd-numbered nodes ensure a clear majority, preventing split-brain scenarios.');
        expect(result[0].status).toBe('Pass');
    });

    test('should detect non-readiness with transient queue', () => {
        expect.assertions(4);
        const definition = {
            rabbit_version: '3.12.5',
            queues: [
                { durable: false, auto_delete: false, arguments: { 'x-queue-type': 'classic' } },
            ],
            policies: []
        };
        const selectedErlangVersion = '26.0';
        const nodes = 3;

        const result = analyze(definition, selectedErlangVersion, nodes);

        expect(result).toHaveLength(4);
        expect(result[3].status).toBe('Fail');
        expect(result[3].message).toContain('Support for transient queues is deprecated and will be removed in RabbitMQ 4.0.');
        expect(result[0].status).toBe('Fail');
    });
});