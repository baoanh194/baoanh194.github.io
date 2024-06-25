const MAX_SIZE = 1024 * 1024 * 1024; // Maximum file size set to 1 GB

// I cannot put it in separate file, I got the error: ReferenceError: require is not defined
const MESSAGES = {
    READY:                      'Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!',
    NOT_READY:                  'Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.',
    UPGRADE_RMQ_VERSION:        'Please consider upgrading RabbitMQ to the 3.13.x version.',
    COMPATIBLE_RMQ_VERSION:     'RabbitMQ version ${version} is compatible.',
    UNSUPPORTED_ERLANG_VERSION: 'Erlang version ${version} is not supported for RabbitMQ 4.0. Minimum required version is 26.0.',
    COMPATIBLE_ERLANG_VERSION:  'Erlang version ${version} is compatible.',
    EVEN_NODE_COUNT:            'Even numbers of cluster nodes are not recommended. Odd numbers of cluster nodes are highly recommended. Odd-numbered nodes ensure a clear majority, preventing split-brain scenarios.',
    SUFFICIENT_NODE_COUNT:      'The cluster has a sufficient number of nodes: ${nodes}.',
    INVALID_NODE_COUNT:         'Please enter a valid number of nodes.',
    CLASSIC_MIRRORING:          'Classic queue mirroring will be removed in 4.0, consider moving to Quorum queues for replication and data safety.',
    PRIORITY_MIRRORING:         'Priorities mirroring queues are not available in 4.0.',
    TRANSIENT_QUEUES:           'Support for transient queues is deprecated and will be removed in RabbitMQ 4.0.',
    ALL_GOOD:                   'No deprecated features found.',
    ERROR_PARSING:              'Error parsing the definition file. Please ensure it is a valid JSON file.'
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        analyzeDefinition,
        validateInputs,
        displayAnalysis,
        generateResultHTML,
        analyze,
        getReadinessMessage,
        isVersionOlder
    };
}

//replaces placeholders in message templates with actual values
function replacePlaceholders(template, replacements) {
    return template.replace(/\${(.*?)}/g, (_, key) => replacements[key] || '');
}

function analyzeDefinition() {
    const nodes = parseInt(document.getElementById('nodes').value, 10);
    const selectedErlangVersion = document.getElementById('erlangVersion').value;
    const fileInput = document.getElementById('definitions');
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!validateInputs(selectedErlangVersion, fileInput, nodes, resultDiv)) {
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const definition = JSON.parse(event.target.result);
            const analysisResults = analyze(definition, selectedErlangVersion, nodes);
            displayAnalysis(analysisResults, resultDiv);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            resultDiv.textContent = MESSAGES.ERROR_PARSING;
        }
    };

    reader.onerror = () => {
        resultDiv.textContent = 'Error reading the file. Please try again.';
    };

    reader.readAsText(file);
}

function validateInputs(selectedErlangVersion, fileInput, nodes, resultDiv) {
    // validate OTP version
    if (!selectedErlangVersion) {
        resultDiv.innerHTML = '<p class="error">Please choose an Erlang/OTP version.</p>';
        return false;
    }
    // validate if no file input
    if (fileInput.files.length === 0) {
        resultDiv.innerHTML = '<p class="error">Please upload a definition file.</p>';
        return false;
    }

    if (isNaN(nodes) || nodes <= 0) {
        resultDiv.innerHTML = '<div class="error">Please enter a valid number of nodes.</div>';
        return false;
    }

    // Check if the file is too large
    const file = fileInput.files[0];
    if (file.size > MAX_SIZE) {
        resultDiv.textContent = `The definition file is too large. Please upload a file smaller than ${MAX_SIZE / 1024 / 1024 / 1024} GB.`;
        return false;
    }
    return true;
}

function displayAnalysis(analysisResults, resultDiv) {
    const readinessMessage = getReadinessMessage(analysisResults);
    resultDiv.innerHTML = generateResultHTML(readinessMessage, analysisResults);
}

function generateResultHTML(readinessMessage, analysisResults) {
    let html = `<div class="${readinessMessage.isReady ? 'ready' : 'not-ready'}">${readinessMessage.message}</div>`;
    html += `<br><table><tr><th>Criteria</th><th>Reason</th><th>Status</th></tr>`;
    analysisResults.forEach(result => {
        const statusClass = result.status === 'Pass' ? 'pass' : 'fail';
        html += `<tr><td>${result.criteria}</td><td>${result.message}</td><td class="${statusClass}">${result.status}</td></tr>`;
    });
    html += `</table>`;
    return html;
}

function analyze(definition, selectedErlangVersion, nodes) {
    const rabbitmqVersion = definition.rabbit_version;
    const analysisResults = [];

    if (rabbitmqVersion && isVersionOlder(rabbitmqVersion, '3.13.0')) {
        analysisResults.push({
            criteria: 'RabbitMQ Version',
            status: 'Fail',
            message: MESSAGES.UPGRADE_RMQ_VERSION
        });
    } else {
        analysisResults.push({
            criteria: 'RabbitMQ Version',
            status: 'Pass',
            message: replacePlaceholders(MESSAGES.COMPATIBLE_RMQ_VERSION, { version: definition.rabbit_version })
        });
    }

    if (parseInt(selectedErlangVersion, 10) < 26) {
        analysisResults.push({
            criteria: 'Erlang Version',
            status: 'Fail',
            message: replacePlaceholders(MESSAGES.UNSUPPORTED_ERLANG_VERSION, { version: selectedErlangVersion })
        });
    } else {
        analysisResults.push({
            criteria: 'Erlang Version',
            status: 'Pass',
            message: replacePlaceholders(MESSAGES.COMPATIBLE_ERLANG_VERSION, { version: selectedErlangVersion })
        });
    }

    if (nodes % 2 === 0) { // Check for even number of nodes
        analysisResults.push({
            criteria: 'Number of Nodes',
            status: 'Fail',
            message: MESSAGES.EVEN_NODE_COUNT
        });
    } else {
        analysisResults.push({
            criteria: 'Number of Nodes',
            status: 'Pass',
            message: replacePlaceholders(MESSAGES.SUFFICIENT_NODE_COUNT, { nodes: nodes })
        });
    }

    // Check for deprecated features
    const priorityQueues = definition.queues.some(queue => queue.arguments && queue.arguments['x-max-priority']);
    const classicMirroringQueues = definition.queues.some(queue => queue.arguments && queue.arguments['ha-mode']) || definition.policies.some(policy => policy.definition && policy.definition['ha-mode']);
    const transientQueues = definition.queues.some(queue => !queue.durable);

    if (classicMirroringQueues) {
        analysisResults.push({
            criteria: 'Deprecated Features',
            status: 'Fail',
            message: MESSAGES.CLASSIC_MIRRORING
        });
    }

    if (priorityQueues && classicMirroringQueues) {
        analysisResults.push({
            criteria: 'Deprecated Features',
            status: 'Fail',
            message: MESSAGES.PRIORITY_MIRRORING
        });
    }

    if (transientQueues) {
        analysisResults.push({
            criteria: 'Deprecated Features',
            status: 'Fail',
            message: MESSAGES.TRANSIENT_QUEUES
        });
    }

    if (!classicMirroringQueues && !priorityQueues && !transientQueues) {
        analysisResults.push({
            criteria: 'Deprecated Features',
            status: 'Pass',
            message: MESSAGES.ALL_GOOD
        });
    }

    return analysisResults;
}

function getReadinessMessage(analysisResults) {
    let isReady = true;
    let message = MESSAGES.READY;

    for (const result of analysisResults) {
        if (result.status !== 'Pass') {
            isReady = false;
            message = MESSAGES.NOT_READY;
            break;
        }
    }

    return { isReady, message };
}

function isVersionOlder(currentVersion, minimumVersion) {
    const currentParts = currentVersion.split('.').map(Number);
    const minimumParts = minimumVersion.split('.').map(Number);

    for (let i = 0; i < minimumParts.length; i++) {
        if (currentParts[i] < minimumParts[i]) return true;
        if (currentParts[i] > minimumParts[i]) return false;
    }
    return false;
}