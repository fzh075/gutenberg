/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../store';

export function useTasks() {
	const tasks = useSelect(select => select(editorStore).getTasks());
	const { addTask, completeTask, skipTask, resetTask } = useDispatch(editorStore);

	return {
		tasks,
		addTask,
		completeTask,
		skipTask,
		resetTask
	};
}

// export function useTaskProgress() {
// 	return useSelect(select => ({
// 		progress: select('core/editor').getTaskProgress(),
// 		isTaskCompleted: select('core/editor').isTaskCompleted()
// 	}));
// }
