const { k8sApi, customObjectsApi } = require('./server/kubernetes');

async function runBuildPipeline(id, github_url, commit_id, subdirectory) {
    const tektonGroup = 'tekton.dev';
    const tektonVersion = 'v1beta1';
    const tektonPluralPipelineRun = 'pipelineruns';
    const tektonPluralPVC = 'persistentvolumeclaims';
    const namespace = 'ci-cd';

    const packetwareContainerRegistryImage = `container.packetware.net/knative/${id}:${commit_id}`;

    try {
        // Create PVC
        const pvc = {
            apiVersion: 'v1',
            kind: 'PersistentVolumeClaim',
            metadata: {
                name: `${commit_id}-pvc`,
                namespace: namespace,
            },
            spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                    requests: {
                        storage: '1Gi',
                    },
                },
            },
        };

        const createdPVC = await k8sApi.createNamespacedPersistentVolumeClaim(
            namespace,
            pvc
        );

        // Create PipelineRun
        const pipelineRun = {
            apiVersion: 'tekton.dev/v1beta1',
            kind: 'PipelineRun',
            metadata: {
                name: 'git-buildpacks',
                namespace: namespace,
            },
            spec: {
                pipelineRef: {
                    name: 'git-buildpacks',
                },
                workspaces: [
                    {
                        name: 'source-workspace',
                        subPath: 'source',
                        persistentVolumeClaim: {
                            claimName: `${deployment_id}`,
                        },
                    },
                    {
                        name: 'cache-workspace',
                        subPath: 'cache',
                        persistentVolumeClaim: {
                            claimName: `${deployment_id}`,
                        },
                    },
                ],
                params: [
                    {
                        name: 'url',
                        value: github_url,
                    },
                    {
                        name: 'revision',
                        value: commit_id,
                    },
                    {
                        name: 'subdirectory',
                        value: subdirectory,
                    },
                    {
                        name: 'image',
                        value: packetwareContainerRegistryImage,
                    },
                ],
            },
        };

        const createdPipelineRun = await customObjectsApi.createNamespacedCustomObject(
            tektonGroup,
            tektonVersion,
            namespace,
            tektonPluralPipelineRun,
            pipelineRun
        );

        // Delete PVC and PV
        /*
        await k8sApi.deleteNamespacedPersistentVolumeClaim(
            `${commit_id}-pvc`,
            namespace
        );
        */

        return {
            pvc: createdPVC,
            task: createdTask,
            pipelineRun: createdPipelineRun,
            success: true,
        };
    } catch (error) {
        console.error('Error creating Tekton pipeline:', error.message);
        return { success: false, error: error.message };
    }
}
