const fs = require('fs');
const path = require('path');
const { analyze } = require('../../source/rabbitmq-analysis');

describe('analyze', () => {

  it('Test input data from basic_definition.json', () => {
    expect.assertions(1);
    const definitionPath = path.join(__dirname, '../json/basic_definitions.json');
    const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
    const selectedErlangVersion = '26';
    const nodes = 3;

    const expectedResult = [
      {"criteria": "RabbitMQ Version", "message": "RabbitMQ version 3.13.3 is compatible.", "status": "Pass"},
      {"criteria": "Erlang Version", "message": "Erlang version 26 is compatible.", "status": "Pass"},
      {"criteria": "Number of Nodes", "message": "The cluster has a sufficient number of nodes: 3.", "status": "Pass"},
      {"criteria": "Deprecated Features", "message": "No deprecated features found.", "status": "Pass"}
    ];
    const result = analyze(definition, selectedErlangVersion, nodes);
    expect(result).toEqual(expectedResult);
  });

  it('Test input data from priority-mirroring-queue.json', () => {
    expect.assertions(1);
    const definitionPath = path.join(__dirname, '../json/priority-mirroring-queue.json');
    const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
    const selectedErlangVersion = '26';
    const nodes = 3;

    const expectedResult = [
      {"criteria": "RabbitMQ Version", "message": "Please consider upgrading RabbitMQ to the 3.13.x version.", "status": "Fail"},
      {"criteria": "Erlang Version", "message": "Erlang version 26 is compatible.", "status": "Pass"},
      {"criteria": "Number of Nodes", "message": "The cluster has a sufficient number of nodes: 3.", "status": "Pass"},
      {"criteria": "Deprecated Features", "message": "Classic queue mirroring will be removed in 4.0, consider moving to Quorum queues for replication and data safety.", "status": "Fail"},
      {"criteria": "Deprecated Features", "message": "Priorities mirroring queues are not available in 4.0.", "status": "Fail"}];

    const result = analyze(definition, selectedErlangVersion, nodes);
    expect(result).toEqual(expectedResult);
  });

  it('Test input data from mix_definitions.json', () => {
    expect.assertions(1);
    const definitionPath = path.join(__dirname, '../json/mix_definitions.json');
    const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
    const selectedErlangVersion = '26';
    const nodes = 3;

    const expectedResult = [
    {"criteria": "RabbitMQ Version", "message": "Please consider upgrading RabbitMQ to the 3.13.x version.", "status": "Fail"},
    {"criteria": "Erlang Version", "message": "Erlang version 26 is compatible.", "status": "Pass"},
    {"criteria": "Number of Nodes", "message": "The cluster has a sufficient number of nodes: 3.", "status": "Pass"},
    {"criteria": "Deprecated Features", "message": "Classic queue mirroring will be removed in 4.0, consider moving to Quorum queues for replication and data safety.", "status": "Fail"},
    {"criteria": "Deprecated Features", "message": "Priorities mirroring queues are not available in 4.0.", "status": "Fail"},
    {"criteria": "Deprecated Features", "message": "Support for transient queues is deprecated and will be removed in RabbitMQ 4.0.", "status": "Fail"}];
    const result = analyze(definition, selectedErlangVersion, nodes);
    expect(result).toEqual(expectedResult);
  });


});