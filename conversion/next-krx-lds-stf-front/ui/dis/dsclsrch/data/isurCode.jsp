<%@ page language="java" contentType="application/json; charset=UTF-8"
	pageEncoding="UTF-8"%><%@ page
	import="java.util.regex.Matcher,java.util.regex.Pattern,org.apache.commons.io.IOUtils"%>
<%
String value = "comIsur";

String resString = "{";
String[] items = value.split(",");
for (String item : items) {
	if (item.equals("comIsur")) { //발행회사검색
		resString += "\"dlt_commonCodecomIsur\":[";
		resString += "{\"SPOT_ISU_TRD_MKT_TP_CD\":\"2\",\"COM_ABBRV\":\"삼천당제약\",\"ISUR_CD\":\"00025\",\"LIST_STAT_CD\":\"\",\"rowStatus\":\"R\"},{\"SPOT_ISU_TRD_MKT_TP_CD\":\"2\",\"COM_ABBRV\":\"대아건설\",\"ISUR_CD\":\"00038\",\"LIST_STAT_CD\":\"D\",\"rowStatus\":\"R\"},{\"SPOT_ISU_TRD_MKT_TP_CD\":\"2\",\"COM_ABBRV\":\"중앙에너비스\",\"ISUR_CD\":\"00044\",\"LIST_STAT_CD\":\"\",\"rowStatus\":\"R\"},{\"SPOT_ISU_TRD_MKT_TP_CD\":\"2\",\"COM_ABBRV\":\"대한제지\",\"ISUR_CD\":\"00053\",\"LIST_STAT_CD\":\"D\",\"rowStatus\":\"R\"},{\"SPOT_ISU_TRD_MKT_TP_CD\":\"2\",\"COM_ABBRV\":\"삼덕제지\",\"ISUR_CD\":\"00055\",\"LIST_STAT_CD\":\"D\",\"rowStatus\":\"R\"}";
		resString += "]";
	}
}
resString += "}";
out.print(resString);
%>