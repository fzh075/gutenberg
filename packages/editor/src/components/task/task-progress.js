/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ProgressBar } from '@wordpress/components';

/**
 * Internal dependencies
 */

export function TaskProgress({ tasks }) {
	const completedTasks = tasks.filter(task => task.status === 'completed');
	const requiredTasks = tasks.filter(task => task.required);
	const completedRequiredTasks = requiredTasks.filter(task => task.status === 'completed');

	const progress = requiredTasks.length > 0
		? (completedRequiredTasks.length / requiredTasks.length) * 100
		: 100;

	return (
		<div className="editor-task-progress">
			<div className="editor-task-progress__header">
				<span>{__('发布准备度')}</span>
				<span>{Math.round(progress)}%</span>
			</div>
			<ProgressBar value={progress} />
			<div className="editor-task-progress__stats">
				{__('已完成 {{completed}}/{{total}} 个必需任务', {
					completed: completedRequiredTasks.length,
					total: requiredTasks.length
				})}
			</div>
		</div>
	);
}
