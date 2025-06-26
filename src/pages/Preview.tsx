import { useParams } from 'react-router-dom';

export const Preview = () => {
  const { projectId } = useParams();

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Preview Mode
        </h1>
        <p className="text-neutral-600">
          Project ID: {projectId}
        </p>
        <p className="text-sm text-neutral-500 mt-4">
          Live preview coming soon...
        </p>
      </div>
    </div>
  );
};