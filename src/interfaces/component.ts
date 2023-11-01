export interface ComponentCreate {
    name: string;
    label_id?: number;
    type_idx: number;
    text_id?: number;
    emoji?: string;
    custom_id?: string;
    value?: string;
    style_id: number;
    min_values?: number;
    max_values?: number;
    disabled_yn?: boolean;
    required_yn?: boolean;
    use_yn?: boolean;
    edit_yn?: boolean;
    permission_type?: number;
    order_by?: number;
}

export interface ComponentOptionCreate {
    option_id: string;
    label_id: number;
    value: string;
    description_id: number;
    emoji: string;
    default_yn: string;
    use_yn: string;
    permission_type: number;
}

// component_row_id ,component_id ,sort_number
export interface ComponentActionRow {
    component_row_id: number;
    component_id: number;
    name: string;
    sort_number: number;
}
