<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" encoding="UTF-8" />

  <xsl:template match="/"><xsl:apply-templates select="feed"/>
  </xsl:template>

  <xsl:template match="feed">
    <xsl:call-template name="header"/>
    <xsl:apply-templates select="doc"/>
  </xsl:template>

  <xsl:template name="header">@description=Wikipedia Abstract
@title=Wikipedia Abstract</xsl:template>

  <xsl:template match="doc">
iXXXXXXX&#xA;#title=<xsl:value-of select="title"/>
b1<xsl:value-of select="abstract"/>
  </xsl:template>

</xsl:stylesheet>
