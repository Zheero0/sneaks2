/* eslint-disable react/no-unescaped-entities */
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column
  } from '@react-email/components';
  import * as React from 'react';
  import type { Order } from '@/lib/types';
  
  const _baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  
  export const OrderConfirmationEmail = ({ order }: {order: Order}) => {
    const previewText = `Your SneaksWash order #${order.id.substring(0,7)} is confirmed!`;
  
    return (
      <Html>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <style>
            {`
              :root {
                color-scheme: light;
                supported-color-schemes: light;
              }
              /* Removed explicit dark-mode body background to let email inherit default */
@media (prefers-color-scheme: dark) {
                 /* body and outer backgrounds left unset */
                .card {
                    background-color: #1c1917 !important;
                }
              }
            `}
          </style>
        </Head>
        <Preview>{previewText}</Preview>
        <Body style={main}>
          {/*[if mso | IE]>
          <table role="presentation" width="100%"
            style="background-color:#0c0a09;">
            <tr>
              <td></td>
              <td width="580">
          <![endif]*/}
          <table align="center" width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation" style={main}>
            <tbody>
              <tr>
                <td>
                  <Container style={container} className="main-container">
                    <Section style={box} className="content-box">
                      <Row style={headerRow}>
                        <Column align="left">
                            <Img
                            src={`${_baseUrl}/trans-logo.svg`}
                            width="50"
                            height="50"
                            alt="SneaksWash Logo"
                            />
                        </Column>
                        <Column align="right">
                            <Text style={headerText}>Order Confirmed</Text>
                        </Column>
                      </Row>
                      <Hr style={hr} />
                      <Heading style={heading}>Thanks for your order, {order.customerName}!</Heading>
                      <Text style={paragraph}>
                        We&rsquo;ve received your order and are getting it ready for you. You can view your order details below.
                      </Text>
                      
                      <Section style={card} className="card">
                        <Text style={cardHeader}>Order Summary - #{order.id.substring(0,7)}</Text>
                        <Hr style={hr} />
                        <Row style={itemRow}>
                            <Column style={itemTitle}>Service:</Column>
                            <Column style={itemValue} align="right">{order.service} (x{order.quantity})</Column>
                        </Row>
                        {order.repaint && (
                            <Row style={itemRow}>
                                <Column style={itemTitle}>Add-on:</Column>
                                <Column style={itemValue} align="right">Repaint</Column>
                            </Row>
                        )}
                        <Row style={itemRow}>
                            <Column style={itemTitle}>Delivery Method:</Column>
                            <Column style={{...itemValue, textTransform: 'capitalize'}} align="right">{order.deliveryMethod}</Column>
                        </Row>
                        <Row style={itemRow}>
                            <Column style={itemTitle}>Scheduled for:</Column>
                            <Column style={itemValue} align="right">{order.date}</Column>
                        </Row>
                         {order.deliveryMethod === 'collection' && (
                            <Row style={itemRow}>
                                <Column style={itemTitle}>Collection Address:</Column>
                                <Column style={itemValue} align="right">{order.pickupAddress}</Column>
                            </Row>
                         )}
                        <Hr style={hr} />
                        <Row style={totalRow}>
                            <Column style={totalTitle}>Total</Column>
                            <Column style={totalValue} align="right">£{order.totalCost?.toFixed(2)}</Column>
                        </Row>
                      </Section>
          
                      <Text style={paragraph}>
                        We&rsquo;ll notify you again once your order status is updated. If you have any questions, please don&rsquo;t hesitate to contact us.
                      </Text>
                      <Hr style={hr} />
                      <Text style={footer}>
                         <Link href="https://sneakswash.com" style={footerLink}>sneakswash.com</Link>
                        <br/>
                        Store first St Modwen Rd, Trafford Park, M32 0ZF
                        <br/>
                        Mon - Sat: 8am - 6pm | Sun: 10am - 4pm
                      </Text>
                    </Section>
                  </Container>
                </td>
              </tr>
            </tbody>
          </table>
          {/*[if mso | IE]>
              </td>
              <td></td>
            </tr>
          </table>
          <![endif]*/}
        </Body>
      </Html>
    );
  };
  
  export default OrderConfirmationEmail;
  
  const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '100%',
    maxWidth: '580px',
  };
  
  const box = {
    padding: '24px',
    backgroundColor: '#1c1917',
    border: '1px solid #27272a',
    borderRadius: '12px',
  };

  const headerRow = {
    width: '100%',
  }

  const headerText = {
    color: '#a1a1aa',
    fontSize: '14px',
    margin: '0',
  }
  
  const heading = {
    color: '#fafafa',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
  };
  
  const paragraph = {
    color: '#a1a1aa',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '16px 0',
  };
  
  const hr = {
    borderColor: '#27272a',
    margin: '20px 0',
  };
  
  const footerLink = {
    color: '#8EACFF',
    textDecoration: 'underline',
  };

  const footer = {
    color: '#a1a1aa',
    fontSize: '12px',
    lineHeight: '20px',
    textAlign: 'center' as const,
    margin: '20px 0 0 0',
  };
  
  const card = {
    backgroundColor: '#1c1917',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #27272a'
  }

  const cardHeader = {
    color: '#fafafa',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  }

  const itemRow = {
    width: '100%',
    padding: '4px 0',
  }
  const itemTitle = {
    color: '#a1a1aa',
    fontSize: '14px'
  }
  const itemValue = {
    color: '#fafafa',
    fontSize: '14px',
    fontWeight: '500'
  }
  const totalRow = {
    width: '100%',
    paddingTop: '8px'
  }
  const totalTitle = {
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: 'bold'
  }
  const totalValue = {
    color: '#8EACFF',
    fontSize: '16px',
    fontWeight: 'bold',
  }
