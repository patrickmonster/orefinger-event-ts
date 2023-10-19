import { getComponentList } from "controllers/component";
import menu from "./menu";


export const getComponentListMemu = async ( custom_id : string, page: number) =>{
    const components = await getComponentList({ page, limit: 15 });

    return menu({
        custom_id,
        placeholder: '컴포넌트를 선택해주세요!',
        disabled: false,
        max_values: 1,
        min_values: 1,
    }, ...components.map(({  }) => ({ }))
}