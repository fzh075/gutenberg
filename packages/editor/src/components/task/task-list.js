/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import {useDispatch} from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

export function TaskList({ tasks }) {
	const { completeTask, skipTask, resetTask } = useDispatch(editorStore);

	const handleTaskToggle = (taskId, completed) => {
		if (completed) {
			completeTask(taskId);
		} else {
			resetTask(taskId);
		}
	};

	const handleSkipTask = (taskId) => {
		skipTask(taskId);
	};

	return (
		<PanelBody title={__('Tasks')} initialOpen={true}>
			{Object.values(tasks).map(task => (
				<div>
					{task.name}
					{task.messageTemplate}
					{task.completed ? '✅' : '❌'}
				</div>
				// <TaskItem
				// 	key={task.id}
				// 	task={task}
				// 	onToggle={handleTaskToggle}
				// 	onSkip={handleSkipTask}
				// />
			))}
		</PanelBody>
	);
}
