select sum(dispose_price) from (select
	b.*,
	c.dispose_name,
	c.dispose_price,
	IFNULL(e.dispose_sub_type_name,'') as dispose_sub_type_name,
	e.dispose_highlight_id,
	e.dispose_sub_type,
	IFNULL(e.dispose_sub_type_enname,'') as dispose_sub_type_enname,
	IFNULL(e.icon_id,'') as icon_id
from case_info a,
	(select 
		x.case_id,
		x.case_version,
		x.status_id,
		x.dispose_id,
		x.dispose_type,
		x.sort_id,
		x.if_key,
		x.dispose_weight,
		x.dispose_classify,
		x.dispose_reason,
		0 if_related_history,
		x.if_basic_oper_item,
		IFNULL(x.result_id,'') as result_id
	from 
		case_dispose x 
	where  
		1=1
		-- <if test="case_id_str !='' and case_id_str != null">
			and x.case_id = '20170101010000001'
	 	-- </if>
	 	-- <if test="case_version != 0 and case_version != null">
			and x.case_version = 1
	 	-- </if>
	UNION ALL
	select 
		x.case_id,
		x.case_version,
		y.status_id,
		x.dispose_id,
		x.dispose_type,
		x.sort_id,
		x.if_key,
		y.dispose_weight,
		x.dispose_classify,
		x.dispose_reason,
		1 if_related_history,
		0 if_basic_oper_item,
		IFNULL(x.result_id,'') as result_id
	from 
		case_dispose x inner join related_history y 
	on 
		x.case_id = y.case_id and x.case_version = y.case_version and x.status_id = y.before_status_id and x.dispose_id = y.dispose_id and x.dispose_type = y.dispose_type 
	where 
		1=1
		-- <if test="case_id_str !='' and case_id_str != null">
			and x.case_id = '20170101010000001'
	 	-- </if>
	 	-- <if test="case_version != 0 and case_version != null">
			and x.case_version =1
	 	-- </if>
 	) b,
	basic_dispose c ,
	case_status d ,
	dispose_sub_type_info e
where 
	a.case_id = b.case_id
	-- <choose>
		-- <when test="case_version != 0">
			and b.case_version = 1
			and d.case_version = 1				
		-- </when>
		-- <otherwise>
			-- and a.current_version = b.case_version
			-- and a.current_version = d.case_version
		-- </otherwise>
	-- </choose>
	-- <if test="case_id_str !='' and case_id_str != null"> 
		and a.case_id='20170101010000001'
	-- </if>
	and a.case_id =d.case_id
	and b.dispose_id = c.dispose_id
	and b.status_id = d.status_id
	and c.dispose_type = e.dispose_type 
	and c.dispose_sub_type = e.dispose_sub_type
	order by b.case_id, d.status_id,b.dispose_type,e.dispose_sub_type, b.sort_id, b.dispose_id) b  where dispose_classify = 1