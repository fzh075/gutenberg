/**
 * WordPress dependencies
 */
import {createSlotFill, PanelBody} from '@wordpress/components';
import {usePluginContext} from '@wordpress/plugins';

/**
 * Internal dependencies
 */

const {Fill, Slot} = createSlotFill('PluginTaskPanel');

const PluginTaskPanel = ({
													 children,
													 className,
													 title,
													 initialOpen = false,
													 icon,
													 taskType
												 }) => {
	const {icon: pluginIcon} = usePluginContext();

	return (
		<Fill>
			<PanelBody
				className={className}
				initialOpen={initialOpen}
				title={title}
				icon={icon ?? pluginIcon}
				data-task-type={taskType}
			>
				{children}
			</PanelBody>
		</Fill>
	);
};

PluginTaskPanel.Slot = Slot;

export default PluginTaskPanel;

// import { PluginTaskPanel } from '@wordpress/editor';
// import { __ } from '@wordpress/i18n';
// import { useSelect } from '@wordpress/data';
//
// function WooCommerceTasks() {
// 	const { productData } = useSelect(select => ({
// 		productData: select('core/editor').getEditedPostAttribute('meta')?.woocommerce
// 	}));
//
// 	const tasks = [
// 		{
// 			id: 'wc-product-price',
// 			title: __('设置产品价格'),
// 			status: productData?.price ? 'completed' : 'pending',
// 			required: true
// 		},
// 		{
// 			id: 'wc-product-inventory',
// 			title: __('设置库存数量'),
// 			status: productData?.stock_quantity ? 'completed' : 'pending',
// 			required: true
// 		},
// 		{
// 			id: 'wc-product-shipping',
// 			title: __('配置运费设置'),
// 			status: productData?.shipping_class ? 'completed' : 'pending',
// 			required: false
// 		}
// 	];
//
// 	return (
// 		<PluginTaskPanel
// 			title={__('WooCommerce 产品检查')}
// 			taskType="woocommerce"
// 		>
// 			{tasks.map(task => (
// 				<TaskItem key={task.id} task={task} />
// 			))}
// 		</PluginTaskPanel>
// 	);
// }
