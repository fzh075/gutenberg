/**
 * WordPress dependencies
 */
import {useSelect, useDispatch} from '@wordpress/data';
import {useState, useEffect} from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';
import { TaskList } from './task-list';
import { TaskProgress } from './task-progress';

export function Task() {
	const post = useSelect((select) => select(editorStore).getCurrentPost());
	const edits = useSelect((select) => select(editorStore).getPostEdits()); // TODO fzh075 edits.title 12 bug
	const {setTasks: setStoreTasks} = useDispatch(editorStore);
	const [tasks, setTasks] = useState({});
	const groups = ['post'];

	useEffect(() => {
		(async () => {
			const tasks = await apiFetch({
				path: '/wp/v2/tasks?' + new URLSearchParams(groups.map(group => ['groups[]', group])).toString()
			});
			Object.entries(tasks).forEach(([id, task]) => {
				if (!task.enabled) return;

				if (id === 'task-title-length') {
					const {min, max} = task.config
					task.completed = (!min || post.title.length > (min - 1)) && (!max || post.title.length < (max + 1));
				}
			})
			console.log(tasks)
			setTasks(tasks);
			setStoreTasks(tasks);
		})();
	}, []);

	useEffect(() => {
		if (!tasks || !edits) {
			console.log('xxxxx')
			return
		}

		setTasks(prev => {
			const next = Object.fromEntries(
				Object.entries(prev).map(([id, task]) => {
					if (!task.enabled) return [id, task];
					let completed = task.completed

					if (id === 'task-title-length' && edits.title) {
						const {min, max} = task.config
						completed = (!min || edits.title.length > (min - 1)) && (!max || edits.title.length < (max + 1));
					}

					return completed === task.completed
						? [id, task]
						: [id, { ...task, completed }];
				})
			)

			let result
			if (Object.keys(prev).some(k => prev[k] !== next[k])) {
				result = next;
				setStoreTasks(result);
			} else {
				result = prev;
			}
			console.log(result)
			return result;
		});
	}, [edits.title]);


	// const tasks = useSelect( (select) =>
	// 		select(coreStore).getEntityRecords('root', 'tasks', { groups: ['post'] }),
	// 	[]
	// );

	// const isLoaded = useSelect( (select) =>
	// 		select(coreStore).hasFinishedResolution('getEntityRecords', ['root','tasks', { group: 'post' }]),
	// 	[]
	// );
	//
	// const error = useSelect( (select) =>
	// 		select(coreStore).getLastEntitySaveError('root','tasks', { group: 'post' }),
	// 	[]
	// );

	// const { tasks, settings, isLoading: settingsLoading, isTaskEnabled } = useSelect(select => ({
	// 	tasks: select( taskSettingStore ).getTasks(),
	// 	settings: select( taskSettingStore ).getSettings(),
	// 	isLoading: select( taskSettingStore ).isLoading(),
	// 	isTaskEnabled: select( taskSettingStore ).isTaskEnabled(),
	// }), []);

	// const { tasks, isTaskPanelEnabled } = useSelect(select => ({
	// 	tasks: select( editorStore ).getTasks(),
	// 	isTaskPanelEnabled: select( editorStore ).isTaskPanelEnabled()
	// }), []);

	// const { fetchSettings } = useDispatch(taskSettingStore);
	//
	// useEffect(() => {
	// 	fetchSettings();
	// }, [fetchSettings]);
	//
	// if (!isTaskEnabled) {
	// 	return null;
	// }
	//
	// if (settingsLoading) {
	// 	return <div>{__('Loading task settings...', 'gutenberg')}</div>;
	// }

	return (
		<div className="editor-task-manager">
			{/*<TaskProgress tasks={tasks} />*/}
			{/*{isTaskPanelEnabled && <TaskList tasks={tasks} />}*/}
			<TaskList tasks={tasks}/>
		</div>
	);
}
//
// // const taskSchema = {
// // 	id: string,
// // 	title: string,
// // 	description: string,
// // 	status: 'pending' | 'completed' | 'skipped',
// // 	type: string,
// // 	priority: 'high' | 'medium' | 'low',
// // 	required: boolean,
// // 	actionable: boolean,
// // 	actionUrl: string,
// // 	metadata: object,
// // 	createdAt: Date,
// // 	completedAt: Date,
// // 	skippedAt: Date
// // };
// //
// // const taskConfigSchema = {
// // 	postType: string,
// // 	postStatus: string,
// // 	tasks: taskSchema[],
// // 	enabled: boolean,
// // 	autoComplete: boolean
// // };
//
// // const taskSettings = {
// // 	enabled: true,
// // 	autoComplete: false,
// // 	showProgress: true,
// // 	defaultTasks: ['seo', 'images', 'links'],
// // 	customTasks: [
// // 		{
// // 			id: 'custom-1',
// // 			title: '自定义任务1',
// // 			description: '任务描述',
// // 			required: false
// // 		}
// // 	]
// // };
//
// // const postTypeTaskConfig = {
// // 	post: {
// // 		defaultTasks: ['seo', 'images', 'categories'],
// // 		requiredTasks: ['seo']
// // 	},
// // 	page: {
// // 		defaultTasks: ['seo', 'images'],
// // 		requiredTasks: ['seo']
// // 	},
// // 	product: {
// // 		defaultTasks: ['seo', 'images', 'woocommerce'],
// // 		requiredTasks: ['seo', 'woocommerce']
// // 	}
// // };
