{
    a[NR]=$0;
    $0 !~ /James Thompson(fighter)/
    {
	printf("%s\n%s\n%s\n",a[NR-3],a[NR-2],a[NR-1]);
    }
#    gsub("Wikipedia: ","",$0); # Wikipedia: 
#    print $0;
}
