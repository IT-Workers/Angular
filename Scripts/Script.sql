select
	sum( dispose_price )
from
	case_dispose a,
	basic_dispose b
where
	a.case_id = "20170101010000001"
	and a.case_version = 1
	and a.dispose_classify = 1
	and a.dispose_id = b.dispose_id
