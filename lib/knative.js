const { k8sApi, customObjectsApi } = require('./server/kubernetes');

async function createNamespaceIfNotExists(namespace) {
    try {
        const namespacesList = await k8sApi.listNamespace();
        const namespaceExists = namespacesList.body.items.some(item => item.metadata.name === namespace);

        if (!namespaceExists) {
            const newNamespace = {
                apiVersion: 'v1',
                kind: 'Namespace',
                metadata: {
                    name: namespace,
                },
            };

            await k8sApi.createNamespace(newNamespace);
            console.log(`Namespace '${namespace}' created successfully.`);
        } else {
            console.log(`Namespace '${namespace}' already exists.`);
        }
    } catch (error) {
        console.error('Error creating/checking namespace:', error);
        return { success: false, error: error.message };
    }
}

async function createKNativeService(repo, tag) {
    const group = 'serving.knative.dev';
    const version = 'v1';
    const plural = 'Services';
    const namespace = 'packetware';
    const image = `container.packetware.net/knative/${repo}:${tag}`;
    const name = `${repo}`;

    //await createNamespaceIfNotExists(namespace);
    try {
        const service = {
            apiVersion: `${group}/${version}`,
            kind: 'Service',
            metadata: {
                name: name,
                namespace: namespace,
            },
            spec: {
                template: {
                    spec: {
                        containers: [
                            {
                                image: image, // Replace with your Docker image
                            },
                        ],
                    },
                },
            },
        };

        const createdService = await customObjectsApi.createNamespacedCustomObject(
            group,
            version,
            namespace,
            plural,
            service
        );

        return createdService;
    } catch (error) {
        console.error('Error creating Knative service:', error.message);
        return { success: false, error: error.message };
    }
}

async function listKnativeServices(namespace) {
    try {
        const response = await customObjectsApi.listNamespacedCustomObject(
            'serving.knative.dev',
            'v1',
            namespace,
            'services'
        );

        const services = response.body.items;

        console.log('Knative Services:');
        services.forEach((service) => {
            console.log(`- ${service.metadata.name}`);
        });

        return services;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createNamespaceIfNotExists,
    createKNativeService,
    listKnativeServices,
};