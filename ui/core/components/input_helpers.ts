import { Player } from '../player.js';
import { Spec } from '../proto/common.js';
import { ActionId } from '../proto_utils/action_id.js';
import { SpecOptions, SpecRotation } from '../proto_utils/utils.js';
import { EventID, TypedEvent } from '../typed_event.js';
import { randomUUID } from '../utils.js';
import { BooleanPickerConfig } from './boolean_picker.js';
import { EnumPickerConfig, EnumValueConfig } from './enum_picker.js';
import { IconEnumPickerConfig, IconEnumValueConfig } from './icon_enum_picker.js';
import { IconPickerConfig, IconPickerDirection } from './icon_picker.js';
import { MultiIconPickerConfig } from './multi_icon_picker.js';
import { NumberPickerConfig } from './number_picker.js';

export interface TypedMultiIconPickerConfig<ModObject> extends MultiIconPickerConfig<ModObject> {
	values: Array<IconPickerConfig<ModObject, any>>;
	direction?: IconPickerDirection;
	label?: string;
	tooltip?: string;
}

export function makeMultiIconInput<ModObject>(config: TypedMultiIconPickerConfig<ModObject>): MultiIconPickerConfig<ModObject> {
	return {
		direction: config.direction,
		values: config.values,
		label: config.label,
		tooltip: config.tooltip,
		showWhen: p => config.values.filter(i => !i.showWhen || i.showWhen(p as ModObject)).length > 0,
	};
}

// Extend this to add player callbacks as optional config fields.
interface BasePlayerConfig<SpecType extends Spec, T> {
	getValue?: (player: Player<SpecType>) => T;
	setValue?: (eventID: EventID, player: Player<SpecType>, newVal: T) => void;
	changeEmitter?: (player: Player<SpecType>) => TypedEvent<any>;
	extraCssClasses?: Array<string>;
	showWhen?: (player: Player<SpecType>) => boolean;
}

/////////////////////////////////////////////////////////////////////////////////
//                                    BOOLEAN
/////////////////////////////////////////////////////////////////////////////////

export interface TypedBooleanPickerConfig<ModObject> extends BooleanPickerConfig<ModObject> {
	type: 'boolean';
}

interface WrappedBooleanInputConfig<SpecType extends Spec, ModObject> extends BooleanPickerConfig<ModObject> {
	getModObject: (player: Player<SpecType>) => ModObject;
}
function makeWrappedBooleanInput<SpecType extends Spec, ModObject>(
	config: WrappedBooleanInputConfig<SpecType, ModObject>,
): TypedBooleanPickerConfig<Player<SpecType>> {
	const getModObject = config.getModObject;
	return {
		id: config.id,
		type: 'boolean',
		label: config.label,
		labelTooltip: config.labelTooltip,
		changedEvent: (player: Player<SpecType>) => config.changedEvent(getModObject(player)),
		getValue: (player: Player<SpecType>) => config.getValue(getModObject(player)),
		setValue: (eventID: EventID, player: Player<SpecType>, newValue: boolean) => config.setValue(eventID, getModObject(player), newValue),
		enableWhen: config.enableWhen ? (player: Player<SpecType>) => config.enableWhen!(getModObject(player)) : undefined,
		showWhen: config.showWhen ? (player: Player<SpecType>) => config.showWhen!(getModObject(player)) : undefined,
		extraCssClasses: config.extraCssClasses,
	};
}
export interface PlayerBooleanInputConfig<SpecType extends Spec, Message> extends BasePlayerConfig<SpecType, boolean> {
	fieldName: keyof Message;
	label: string;
	labelTooltip?: string;
	enableWhen?: (player: Player<SpecType>) => boolean;
	showWhen?: (player: Player<SpecType>) => boolean;
}
export function makeSpecOptionsBooleanInput<SpecType extends Spec>(
	config: PlayerBooleanInputConfig<SpecType, SpecOptions<SpecType>>,
): TypedBooleanPickerConfig<Player<SpecType>> {
	return makeWrappedBooleanInput<SpecType, Player<SpecType>>({
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSpecOptions()[config.fieldName] as unknown as boolean),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: boolean) => {
				const newMessage = player.getSpecOptions();
				(newMessage[config.fieldName] as unknown as boolean) = newVal;
				player.setSpecOptions(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.specOptionsChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
		extraCssClasses: config.extraCssClasses,
	});
}
export function makeRotationBooleanInput<SpecType extends Spec>(
	config: PlayerBooleanInputConfig<SpecType, SpecRotation<SpecType>>,
): TypedBooleanPickerConfig<Player<SpecType>> {
	return makeWrappedBooleanInput<SpecType, Player<SpecType>>({
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSimpleRotation()[config.fieldName] as unknown as boolean),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: boolean) => {
				const newMessage = player.getSimpleRotation();
				(newMessage[config.fieldName] as unknown as boolean) = newVal;
				player.setSimpleRotation(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.rotationChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
		extraCssClasses: config.extraCssClasses,
	});
}

/////////////////////////////////////////////////////////////////////////////////
//                                    NUMBER
/////////////////////////////////////////////////////////////////////////////////
export interface TypedNumberPickerConfig<ModObject> extends NumberPickerConfig<ModObject> {
	type: 'number';
}

interface WrappedNumberInputConfig<SpecType extends Spec, ModObject> extends NumberPickerConfig<ModObject> {
	getModObject: (player: Player<SpecType>) => ModObject;
}
function makeWrappedNumberInput<SpecType extends Spec, ModObject>(
	config: WrappedNumberInputConfig<SpecType, ModObject>,
): TypedNumberPickerConfig<Player<SpecType>> {
	const getModObject = config.getModObject;
	return {
		id: config.id,
		type: 'number',
		label: config.label,
		labelTooltip: config.labelTooltip,
		float: config.float,
		positive: config.positive,
		defaultValue: config.defaultValue,
		changedEvent: (player: Player<SpecType>) => config.changedEvent(getModObject(player)),
		getValue: (player: Player<SpecType>) => config.getValue(getModObject(player)),
		setValue: (eventID: EventID, player: Player<SpecType>, newValue: number) => config.setValue(eventID, getModObject(player), newValue),
		enableWhen: config.enableWhen ? (player: Player<SpecType>) => config.enableWhen!(getModObject(player)) : undefined,
		showWhen: config.showWhen ? (player: Player<SpecType>) => config.showWhen!(getModObject(player)) : undefined,
		extraCssClasses: config.extraCssClasses,
	};
}
export interface PlayerNumberInputConfig<SpecType extends Spec, Message> extends BasePlayerConfig<SpecType, number> {
	fieldName: keyof Message;
	label: string;
	labelTooltip?: string;
	percent?: boolean;
	float?: boolean;
	positive?: boolean;
	defaultValue?: number;
	enableWhen?: (player: Player<SpecType>) => boolean;
	showWhen?: (player: Player<SpecType>) => boolean;
	changeEmitter?: (player: Player<SpecType>) => TypedEvent<any>;
}
export function makeSpecOptionsNumberInput<SpecType extends Spec>(
	config: PlayerNumberInputConfig<SpecType, SpecOptions<SpecType>>,
): TypedNumberPickerConfig<Player<SpecType>> {
	const internalConfig = {
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		float: config.float,
		positive: config.positive,
		defaultValue: config.defaultValue,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSpecOptions()[config.fieldName] as unknown as number),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: number) => {
				const newMessage = player.getSpecOptions();
				(newMessage[config.fieldName] as unknown as number) = newVal;
				player.setSpecOptions(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.specOptionsChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
		extraCssClasses: config.extraCssClasses,
	};
	if (config.percent) {
		const getValue = internalConfig.getValue;
		internalConfig.getValue = (player: Player<SpecType>) => getValue(player) * 100;
		const setValue = internalConfig.setValue;
		internalConfig.setValue = (eventID: EventID, player: Player<SpecType>, newVal: number) => setValue(eventID, player, newVal / 100);
	}
	return makeWrappedNumberInput<SpecType, Player<SpecType>>(internalConfig);
}
export function makeRotationNumberInput<SpecType extends Spec>(
	config: PlayerNumberInputConfig<SpecType, SpecRotation<SpecType>>,
): TypedNumberPickerConfig<Player<SpecType>> {
	const internalConfig = {
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		float: config.float,
		positive: config.positive,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSimpleRotation()[config.fieldName] as unknown as number),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: number) => {
				const newMessage = player.getSimpleRotation();
				(newMessage[config.fieldName] as unknown as number) = newVal;
				player.setSimpleRotation(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.rotationChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
		extraCssClasses: config.extraCssClasses,
	};
	if (config.percent) {
		const getValue = internalConfig.getValue;
		internalConfig.getValue = (player: Player<SpecType>) => getValue(player) * 100;
		const setValue = internalConfig.setValue;
		internalConfig.setValue = (eventID: EventID, player: Player<SpecType>, newVal: number) => setValue(eventID, player, newVal / 100);
	}
	return makeWrappedNumberInput<SpecType, Player<SpecType>>(internalConfig);
}

/////////////////////////////////////////////////////////////////////////////////
//                                    ENUM
/////////////////////////////////////////////////////////////////////////////////
export interface TypedEnumPickerConfig<ModObject> extends EnumPickerConfig<ModObject> {
	type: 'enum';
}

interface WrappedEnumInputConfig<SpecType extends Spec, ModObject> extends EnumPickerConfig<ModObject> {
	getModObject: (player: Player<SpecType>) => ModObject;
}
function makeWrappedEnumInput<SpecType extends Spec, ModObject>(config: WrappedEnumInputConfig<SpecType, ModObject>): TypedEnumPickerConfig<Player<SpecType>> {
	const getModObject = config.getModObject;
	return {
		id: config.id,
		type: 'enum',
		label: config.label,
		labelTooltip: config.labelTooltip,
		values: config.values,
		changedEvent: (player: Player<SpecType>) => config.changedEvent(getModObject(player)),
		getValue: (player: Player<SpecType>) => config.getValue(getModObject(player)),
		setValue: (eventID: EventID, player: Player<SpecType>, newValue: number) => config.setValue(eventID, getModObject(player), newValue),
		enableWhen: config.enableWhen ? (player: Player<SpecType>) => config.enableWhen!(getModObject(player)) : undefined,
		showWhen: config.showWhen ? (player: Player<SpecType>) => config.showWhen!(getModObject(player)) : undefined,
	};
}

export interface PlayerEnumInputConfig<SpecType extends Spec, Message> {
	fieldName: keyof Message;
	label: string;
	labelTooltip?: string;
	values: Array<EnumValueConfig>;
	getValue?: (player: Player<SpecType>) => number;
	setValue?: (eventID: EventID, player: Player<SpecType>, newValue: number) => void;
	enableWhen?: (player: Player<SpecType>) => boolean;
	showWhen?: (player: Player<SpecType>) => boolean;
	changeEmitter?: (player: Player<SpecType>) => TypedEvent<any>;
}
// T is unused, but kept to have the same interface as the icon enum inputs.
export function makeSpecOptionsEnumInput<SpecType extends Spec>(
	config: PlayerEnumInputConfig<SpecType, SpecOptions<SpecType>>,
): TypedEnumPickerConfig<Player<SpecType>> {
	return makeWrappedEnumInput<SpecType, Player<SpecType>>({
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		values: config.values,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSpecOptions()[config.fieldName] as unknown as number),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: number) => {
				const newMessage = player.getSpecOptions();
				(newMessage[config.fieldName] as unknown as number) = newVal;
				player.setSpecOptions(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.specOptionsChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
	});
}
// T is unused, but kept to have the same interface as the icon enum inputs.
export function makeRotationEnumInput<SpecType extends Spec>(
	config: PlayerEnumInputConfig<SpecType, SpecRotation<SpecType>>,
): TypedEnumPickerConfig<Player<SpecType>> {
	return makeWrappedEnumInput<SpecType, Player<SpecType>>({
		id: `${String(config.fieldName) || randomUUID()}`,
		label: config.label,
		labelTooltip: config.labelTooltip,
		values: config.values,
		getModObject: (player: Player<SpecType>) => player,
		getValue: config.getValue || ((player: Player<SpecType>) => player.getSimpleRotation()[config.fieldName] as unknown as number),
		setValue:
			config.setValue ||
			((eventID: EventID, player: Player<SpecType>, newVal: number) => {
				const newMessage = player.getSimpleRotation();
				(newMessage[config.fieldName] as unknown as number) = newVal;
				player.setSimpleRotation(eventID, newMessage);
			}),
		changedEvent: config.changeEmitter || ((player: Player<SpecType>) => player.rotationChangeEmitter),
		enableWhen: config.enableWhen,
		showWhen: config.showWhen,
	});
}

/////////////////////////////////////////////////////////////////////////////////
//                                  ICON
/////////////////////////////////////////////////////////////////////////////////
export interface TypedIconPickerConfig<ModObject, T> extends IconPickerConfig<ModObject, T> {
	type: 'icon';
}

interface WrappedIconInputConfig<SpecType extends Spec, ModObject, T> extends IconPickerConfig<ModObject, T> {
	getModObject: (player: Player<SpecType>) => ModObject;
}
function makeWrappedIconInput<SpecType extends Spec, ModObject, T>(
	config: WrappedIconInputConfig<SpecType, ModObject, T>,
): TypedIconPickerConfig<Player<SpecType>, T> {
	const getModObject = config.getModObject;
	return {
		type: 'icon',
		actionId: (player: Player<SpecType>) => config.actionId(getModObject(player)),
		states: config.states,
		showWhen: config.showWhen as any,
		changedEvent: (player: Player<SpecType>) => config.changedEvent(getModObject(player)),
		getValue: (player: Player<SpecType>) => config.getValue(getModObject(player)),
		setValue: (eventID: EventID, player: Player<SpecType>, newValue: T) => config.setValue(eventID, getModObject(player), newValue),
		extraCssClasses: config.extraCssClasses,
	};
}

interface WrappedTypedInputConfig<Message, ModObject, T> {
	getModObject: (player: Player<any>) => ModObject;
	getValue: (modObj: ModObject) => Message;
	setValue: (eventID: EventID, modObj: ModObject, messageVal: Message) => void;
	changeEmitter: (modObj: ModObject) => TypedEvent<any>;
	extraCssClasses?: Array<string>;

	showWhen?: (obj: ModObject) => boolean;
	getFieldValue?: (modObj: ModObject) => T;
	setFieldValue?: (eventID: EventID, modObj: ModObject, newValue: T) => void;
}

export function makeBooleanIconInput<SpecType extends Spec, Message, ModObject>(
	config: WrappedTypedInputConfig<Message, ModObject, boolean>,
	actionId: (modObj: ModObject) => ActionId | null,
	fieldName: keyof Message,
	value?: number,
): TypedIconPickerConfig<Player<SpecType>, boolean> {
	return makeWrappedIconInput<SpecType, ModObject, boolean>({
		getModObject: config.getModObject,
		actionId: actionId,
		states: 2,
		changedEvent: config.changeEmitter,
		showWhen: config.showWhen,
		getValue:
			config.getFieldValue ||
			((modObj: ModObject) =>
				value ? (config.getValue(modObj)[fieldName] as unknown as number) == value : (config.getValue(modObj)[fieldName] as unknown as boolean)),
		setValue:
			config.setFieldValue ||
			((eventID: EventID, modObj: ModObject, newValue: boolean) => {
				const newMessage = config.getValue(modObj);
				if (value) {
					if (newValue) {
						(newMessage[fieldName] as unknown as number) = value;
					} else if ((newMessage[fieldName] as unknown as number) == value) {
						(newMessage[fieldName] as unknown as number) = 0;
					}
				} else {
					(newMessage[fieldName] as unknown as boolean) = newValue;
				}
				config.setValue(eventID, modObj, newMessage);
			}),
		extraCssClasses: config.extraCssClasses,
	});
}

export interface PlayerBooleanIconInputConfig<SpecType extends Spec, Message, T> extends BasePlayerConfig<SpecType, T> {
	fieldName: keyof Message;
	actionId: (player: Player<SpecType>) => ActionId | null;
	value?: number;
}
export function makeSpecOptionsBooleanIconInput<SpecType extends Spec>(
	config: PlayerBooleanIconInputConfig<SpecType, SpecOptions<SpecType>, boolean>,
): TypedIconPickerConfig<Player<SpecType>, boolean> {
	return makeBooleanIconInput<SpecType, SpecOptions<SpecType>, Player<SpecType>>(
		{
			getModObject: (player: Player<SpecType>) => player,
			getValue: (player: Player<SpecType>) => player.getSpecOptions(),
			setValue: (eventID: EventID, player: Player<SpecType>, newVal: SpecOptions<SpecType>) => player.setSpecOptions(eventID, newVal),
			changeEmitter: config.changeEmitter || ((player: Player<SpecType>) => player.specOptionsChangeEmitter),
			extraCssClasses: config.extraCssClasses,
			getFieldValue: config.getValue,
			setFieldValue: config.setValue,
		},
		config.actionId,
		config.fieldName,
		config.value,
	);
}

function makeNumberIconInput<SpecType extends Spec, Message, ModObject>(
	config: WrappedTypedInputConfig<Message, ModObject, number>,
	actionId: (modObj: ModObject) => ActionId | null,
	fieldName: keyof Message,
): TypedIconPickerConfig<Player<SpecType>, number> {
	return makeWrappedIconInput<SpecType, ModObject, number>({
		getModObject: config.getModObject,
		actionId: actionId,
		states: 0, // Must be assigned externally.
		step: 1, // Must be assigned a different value externally.
		changedEvent: config.changeEmitter,
		showWhen: config.showWhen,
		getValue: (modObj: ModObject) => config.getValue(modObj)[fieldName] as unknown as number,
		setValue: (eventID: EventID, modObj: ModObject, newValue: number) => {
			const newMessage = config.getValue(modObj);
			if (newValue < 0) {
				newValue = 0;
			}
			(newMessage[fieldName] as unknown as number) = newValue;
			config.setValue(eventID, modObj, newMessage);
		},
	});
}
export function makeTristateIconInput<SpecType extends Spec, Message, ModObject>(
	config: WrappedTypedInputConfig<Message, ModObject, number>,
	actionId: (modObj: ModObject) => ActionId | null,
	impId: ActionId,
	fieldName: keyof Message,
): TypedIconPickerConfig<Player<SpecType>, number> {
	const input = makeNumberIconInput(config, actionId, fieldName);
	input.states = 3;
	input.improvedId = impId;
	return input;
}
export function makeQuadstateIconInput<SpecType extends Spec, Message, ModObject>(
	config: WrappedTypedInputConfig<Message, ModObject, number>,
	actionId: (modObj: ModObject) => ActionId | null,
	impId: ActionId,
	impId2: ActionId,
	fieldName: keyof Message,
): TypedIconPickerConfig<Player<SpecType>, number> {
	const input = makeNumberIconInput(config, actionId, fieldName);
	input.states = 4;
	input.improvedId = impId;
	input.improvedId2 = impId2;
	return input;
}
export function makeMultistateIconInput<SpecType extends Spec, Message, ModObject>(
	config: WrappedTypedInputConfig<Message, ModObject, number>,
	actionId: (modObj: ModObject) => ActionId | null,
	numStates: number,
	fieldName: keyof Message,
	multiplier?: number,
	reverse?: boolean,
): TypedIconPickerConfig<Player<SpecType>, number> {
	const input = makeNumberIconInput(config, actionId, fieldName);
	input.states = numStates;
	input.step = multiplier;
	input.reverse = reverse;
	return input;
}

export interface TypedIconEnumPickerConfig<ModObject, T> extends IconEnumPickerConfig<ModObject, T> {
	type: 'iconEnum';
}

interface WrappedEnumIconInputConfig<SpecType extends Spec, ModObject, T> extends IconEnumPickerConfig<ModObject, T> {
	getModObject: (player: Player<SpecType>) => ModObject;
}

function makeWrappedEnumIconInput<SpecType extends Spec, ModObject, T>(
	config: WrappedEnumIconInputConfig<SpecType, ModObject, T>,
): TypedIconEnumPickerConfig<Player<SpecType>, T> {
	const getModObject = config.getModObject;
	return {
		type: 'iconEnum',
		numColumns: config.numColumns,
		direction: config.direction,
		tooltip: config.tooltip,
		values: config.values.map(value => {
			if (value.showWhen) {
				const showWhen = value.showWhen;
				value.showWhen = ((player: Player<SpecType>) => showWhen(getModObject(player))) as any;
			}
			return value as unknown as IconEnumValueConfig<Player<SpecType>, T>;
		}),
		equals: config.equals,
		showWhen: (player: Player<SpecType>): boolean => !config.showWhen || (config.showWhen(getModObject(player)) as any),
		zeroValue: config.zeroValue,
		changedEvent: (player: Player<SpecType>) => config.changedEvent(getModObject(player)),
		getValue: (player: Player<SpecType>) => config.getValue(getModObject(player)),
		setValue: (eventID: EventID, player: Player<SpecType>, newValue: T) => config.setValue(eventID, getModObject(player), newValue),
		extraCssClasses: config.extraCssClasses,
	};
}

export function makeEnumIconInput<SpecType extends Spec, Message, ModObject, T>(
	config: WrappedTypedInputConfig<Message, ModObject, T>,
	fieldName: keyof Message,
	values: Array<IconEnumValueConfig<ModObject, T>>,
	numColumns?: number,
	direction?: IconPickerDirection,
	tooltip?: string,
): TypedIconEnumPickerConfig<Player<SpecType>, T> {
	return makeWrappedEnumIconInput<SpecType, ModObject, T>({
		values: values,
		zeroValue: 0 as unknown as T,
		numColumns: numColumns,
		direction: direction || IconPickerDirection.Vertical,
		tooltip: tooltip,
		equals: (a: T, b: T) => a == b,
		getModObject: config.getModObject,
		changedEvent: config.changeEmitter,
		showWhen: config.showWhen,
		getValue: (modObj: ModObject) => config.getValue(modObj)[fieldName] as unknown as T,
		setValue: (eventID: EventID, modObj: ModObject, newValue: T) => {
			const newMessage = config.getValue(modObj);
			(newMessage[fieldName] as unknown as T) = newValue;
			config.setValue(eventID, modObj, newMessage);
		},
	});
}

export interface PlayerEnumIconInputConfig<SpecType extends Spec, Message, T> extends BasePlayerConfig<SpecType, T> {
	fieldName: keyof Message;
	values: Array<IconEnumValueConfig<Player<SpecType>, T>>;
	numColumns?: number;
	direction?: IconPickerDirection;
	tooltip?: string;
}
export function makeSpecOptionsEnumIconInput<SpecType extends Spec, T>(
	config: PlayerEnumIconInputConfig<SpecType, SpecOptions<SpecType>, T>,
): TypedIconEnumPickerConfig<Player<SpecType>, T> {
	return makeEnumIconInput<SpecType, SpecOptions<SpecType>, Player<SpecType>, T>(
		{
			showWhen: config.showWhen,
			getModObject: (player: Player<SpecType>) => player,
			getValue: (player: Player<SpecType>) => player.getSpecOptions(),
			setValue: (eventID: EventID, player: Player<SpecType>, newVal: SpecOptions<SpecType>) => player.setSpecOptions(eventID, newVal),
			getFieldValue: config.getValue,
			setFieldValue: config.setValue,
			changeEmitter: config.changeEmitter || ((player: Player<SpecType>) => player.specOptionsChangeEmitter),
			extraCssClasses: config.extraCssClasses,
		},
		config.fieldName,
		config.values,
		config.numColumns,
		config.direction,
		config.tooltip,
	);
}
export function makeRotationEnumIconInput<SpecType extends Spec, T>(
	config: PlayerEnumIconInputConfig<SpecType, SpecRotation<SpecType>, T>,
): TypedIconEnumPickerConfig<Player<SpecType>, T> {
	return makeEnumIconInput<SpecType, SpecRotation<SpecType>, Player<SpecType>, T>(
		{
			showWhen: config.showWhen,
			getModObject: (player: Player<SpecType>) => player,
			getValue: (player: Player<SpecType>) => player.getSimpleRotation(),
			setValue: (eventID: EventID, player: Player<SpecType>, newVal: SpecRotation<SpecType>) => player.setSimpleRotation(eventID, newVal),
			getFieldValue: config.getValue,
			setFieldValue: config.setValue,
			changeEmitter: config.changeEmitter || ((player: Player<SpecType>) => player.rotationChangeEmitter),
			extraCssClasses: config.extraCssClasses,
		},
		config.fieldName,
		config.values,
		config.numColumns,
		config.direction,
		config.tooltip,
	);
}
