BEGIN{
    num=1;
}

{
    if( $0 == "iXXXXXXX" ){
	sub("XXXXXXX",num++,$0);
	print $0;
    }else{
	print $0;
    }
}
